using System.Security.Cryptography;
using System.Text;
using Ecommerce.Application.Common;
using Ecommerce.Application.Contracts;

namespace Ecommerce.Application.Services;

public sealed class AuthService(IIdentityRepository users, IPasswordService passwords,
    IAccessTokenService tokens)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var placeholder = new Ecommerce.Domain.Entities.User();
        var hash = passwords.Hash(placeholder, request.Password);
        var result = await users.RegisterAsync(request, hash, ct);
        return Issue(result.Profile);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var (user, profile, _) = await users.FindByEmailAsync(request.Email.Trim(), ct);
        if (user is null || profile is null)
            throw new UnauthorizedException("The email or password is invalid.");

        var verification = passwords.Verify(user, user.PasswordHash, request.Password);
        if (verification == PasswordCheck.Failed && LegacyPasswordMatches(user.PasswordHash, request.Password))
        {
            await users.SavePasswordHashAsync(user.UserId, passwords.Hash(user, request.Password), ct);
            verification = PasswordCheck.Success;
        }
        else if (verification == PasswordCheck.UpgradeRequired)
        {
            await users.SavePasswordHashAsync(user.UserId, passwords.Hash(user, request.Password), ct);
        }

        if (verification == PasswordCheck.Failed)
            throw new UnauthorizedException("The email or password is invalid.");

        return Issue(profile);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken ct)
    {
        var user = await users.GetUserForPasswordChangeAsync(userId, ct)
            ?? throw new NotFoundException("User account was not found.");
        var verification = passwords.Verify(user, user.PasswordHash, request.CurrentPassword);
        if (verification == PasswordCheck.Failed && LegacyPasswordMatches(user.PasswordHash, request.CurrentPassword))
            verification = PasswordCheck.Success;
        if (verification == PasswordCheck.Failed)
            throw new UnauthorizedException("The current password is invalid.");
        await users.SavePasswordHashAsync(user.UserId, passwords.Hash(user, request.NewPassword), ct);
    }

    private AuthResponse Issue(UserProfile profile)
    {
        var (token, expires) = tokens.Create(profile);
        return new AuthResponse(token, expires, profile);
    }

    private static bool LegacyPasswordMatches(string storedValue, string provided)
    {
        var stored = Encoding.UTF8.GetBytes(storedValue);
        var supplied = Encoding.UTF8.GetBytes(provided);
        return stored.Length == supplied.Length && CryptographicOperations.FixedTimeEquals(stored, supplied);
    }
}

public sealed class CatalogService(ICatalogRepository catalog)
{
    public Task<PagedResult<ProductListItem>> ListProductsAsync(ProductQuery query, CancellationToken ct) => catalog.ListProductsAsync(query, ct);
    public Task<ProductDetails?> GetProductAsync(int id, CancellationToken ct) => catalog.GetProductAsync(id, ct);
    public Task<AdminProductDetails?> GetAdminProductAsync(int id, CancellationToken ct) => catalog.GetAdminProductAsync(id, ct);
    public Task<int> CreateProductAsync(SaveProductRequest request, CancellationToken ct) => catalog.CreateProductAsync(request, ct);
    public Task<bool> UpdateProductAsync(int id, SaveProductRequest request, CancellationToken ct) => catalog.UpdateProductAsync(id, request, ct);
    public Task<bool> DeactivateProductAsync(int id, CancellationToken ct) => catalog.DeactivateProductAsync(id, ct);
    public Task<PagedResult<CatalogItem>> ListCategoriesAsync(CatalogQuery query, CancellationToken ct) => catalog.ListCategoriesAsync(query, ct);
    public Task<PagedResult<CatalogItem>> ListBrandsAsync(CatalogQuery query, CancellationToken ct) => catalog.ListBrandsAsync(query, ct);
    public Task<int> CreateCategoryAsync(string name, CancellationToken ct) => catalog.CreateCategoryAsync(name, ct);
    public Task<int> CreateBrandAsync(string name, CancellationToken ct) => catalog.CreateBrandAsync(name, ct);
    public Task<bool> UpdateCategoryAsync(int id, string name, bool isActive, CancellationToken ct) => catalog.UpdateCategoryAsync(id, name, isActive, ct);
    public Task<bool> UpdateBrandAsync(int id, string name, bool isActive, CancellationToken ct) => catalog.UpdateBrandAsync(id, name, isActive, ct);
    public Task<bool> DeactivateCategoryAsync(int id, CancellationToken ct) => catalog.DeactivateCategoryAsync(id, ct);
    public Task<bool> DeactivateBrandAsync(int id, CancellationToken ct) => catalog.DeactivateBrandAsync(id, ct);
    public Task<IReadOnlyList<FeaturedItem>> ListFeaturedAsync(CancellationToken ct) => catalog.ListFeaturedAsync(ct);
    public Task SetFeaturedAsync(IReadOnlyList<SetFeaturedRequest> items, CancellationToken ct) => catalog.SetFeaturedAsync(items, ct);
    public Task IncrementVisitAsync(int productId, CancellationToken ct) => catalog.IncrementVisitAsync(productId, ct);
}

public sealed class OrderService(IOrderRepository orders)
{
    public Task<CreatedOrder> CreateAsync(CreateOrderRequest request, int? authenticatedUserId, CancellationToken ct) => orders.CreateAsync(request, authenticatedUserId, ct);
    public Task<PagedResult<OrderSummary>> ListForUserAsync(int userId, int page, int pageSize, CancellationToken ct) => orders.ListForUserAsync(userId, page, pageSize, ct);
    public Task<OrderSummary?> GetAsync(int orderId, int? personId, bool isAdmin, CancellationToken ct) => orders.GetAsync(orderId, personId, isAdmin, ct);
    public Task<TrackingStatus?> GetGuestTrackingAsync(int orderId, string token, CancellationToken ct) => orders.GetGuestTrackingAsync(orderId, token, ct);
    public Task<TrackingStatus> AdvanceAsync(int orderId, int actorUserId, int? requestedStatusId, CancellationToken ct) => orders.AdvanceAsync(orderId, actorUserId, requestedStatusId, ct);
    public Task<DashboardSummary> GetDashboardAsync(CancellationToken ct) => orders.GetDashboardAsync(ct);
}
