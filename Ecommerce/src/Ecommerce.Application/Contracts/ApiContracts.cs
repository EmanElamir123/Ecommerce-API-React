using Ecommerce.Application.Common;
using FluentValidation;

namespace Ecommerce.Application.Contracts;

public sealed record ProductQuery(int Page = 1, int PageSize = 24, string? Search = null,
    int? CategoryId = null, int? BrandId = null, bool? InStock = null,
    string SortBy = "name", bool Descending = false, bool IncludeInactive = false);
public sealed record ProductListItem(int Id, string Code, string Name, string? Description,
    decimal Price, int Stock, string? Brand, IReadOnlyList<string> Categories, string? ImageUrl);
public sealed record ProductDetails(int Id, string Code, string Name, string? Description,
    decimal Price, int Stock, string? Brand, IReadOnlyList<int> CategoryIds,
    IReadOnlyList<string> Categories, IReadOnlyList<string> Images);
public sealed record AdminProductDetails(int Id, string Code, string Name, string? Description,
    decimal Price, decimal Cost, int Stock, bool IsActive, int? BrandId,
    IReadOnlyList<int> CategoryIds, IReadOnlyList<string> Images);
public sealed record SaveProductRequest(string Code, string Name, string? Description,
    decimal Price, decimal Cost, int Stock, int? BrandId, IReadOnlyList<int> CategoryIds,
    IReadOnlyList<string> ImageUrls, bool IsActive = true);
public sealed record CatalogQuery(int Page = 1, int PageSize = 50, string? Search = null,
    bool IncludeInactive = false);
public sealed record CatalogItem(int Id, string Name, bool IsActive);
public sealed record FeaturedItem(int ProductId, int DisplayOrder, bool ShowAsNew,
    string Name, decimal Price, string? ImageUrl);
public sealed record SetFeaturedRequest(int ProductId, int DisplayOrder, bool ShowAsNew);

public interface ICatalogRepository
{
    Task<PagedResult<ProductListItem>> ListProductsAsync(ProductQuery query, CancellationToken ct);
    Task<ProductDetails?> GetProductAsync(int id, CancellationToken ct);
    Task<AdminProductDetails?> GetAdminProductAsync(int id, CancellationToken ct);
    Task<int> CreateProductAsync(SaveProductRequest request, CancellationToken ct);
    Task<bool> UpdateProductAsync(int id, SaveProductRequest request, CancellationToken ct);
    Task<bool> DeactivateProductAsync(int id, CancellationToken ct);
    Task<PagedResult<CatalogItem>> ListCategoriesAsync(CatalogQuery query, CancellationToken ct);
    Task<PagedResult<CatalogItem>> ListBrandsAsync(CatalogQuery query, CancellationToken ct);
    Task<int> CreateCategoryAsync(string name, CancellationToken ct);
    Task<int> CreateBrandAsync(string name, CancellationToken ct);
    Task<bool> UpdateCategoryAsync(int id, string name, bool isActive, CancellationToken ct);
    Task<bool> UpdateBrandAsync(int id, string name, bool isActive, CancellationToken ct);
    Task<bool> DeactivateCategoryAsync(int id, CancellationToken ct);
    Task<bool> DeactivateBrandAsync(int id, CancellationToken ct);
    Task<IReadOnlyList<FeaturedItem>> ListFeaturedAsync(CancellationToken ct);
    Task SetFeaturedAsync(IReadOnlyList<SetFeaturedRequest> items, CancellationToken ct);
    Task IncrementVisitAsync(int productId, CancellationToken ct);
}

public sealed record RegisterRequest(string FirstName, string LastName, string Email,
    string Password, string? Phone);
public sealed record LoginRequest(string Email, string Password);
public sealed record UserProfile(int UserId, int PersonId, string Email, string? Username,
    string FirstName, string LastName, string? Phone, IReadOnlyList<string> Roles);
public sealed record AuthResponse(string AccessToken, DateTime ExpiresAtUtc, UserProfile User);
public enum PasswordCheck { Failed, Success, UpgradeRequired }
public sealed record AdminUser(int UserId, int PersonId, string Email, string? Username,
    string FirstName, string LastName, IReadOnlyList<string> Roles);
public sealed record UpdateProfileRequest(string FirstName, string LastName, string? Phone);
public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public sealed record UpdateRolesRequest(IReadOnlyList<byte> RoleIds);

public interface IIdentityRepository
{
    Task<(Ecommerce.Domain.Entities.User? User, UserProfile? Profile, IReadOnlyList<string> Roles)> FindByEmailAsync(string email, CancellationToken ct);
    Task<(int UserId, UserProfile Profile)> RegisterAsync(RegisterRequest request, string passwordHash, CancellationToken ct);
    Task<UserProfile?> GetProfileAsync(int userId, CancellationToken ct);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct);
    Task<Ecommerce.Domain.Entities.User?> GetUserForPasswordChangeAsync(int userId, CancellationToken ct);
    Task<IReadOnlyList<AdminUser>> ListUsersAsync(CancellationToken ct);
    Task<bool> UpdateRolesAsync(int targetUserId, IReadOnlyList<byte> roleIds, int actingUserId, CancellationToken ct);
    Task SavePasswordHashAsync(int userId, string passwordHash, CancellationToken ct);
}

public interface IPasswordService
{
    string Hash(Ecommerce.Domain.Entities.User user, string password);
    PasswordCheck Verify(Ecommerce.Domain.Entities.User user, string hash, string password);
}

public interface IAccessTokenService
{
    (string Token, DateTime ExpiresAtUtc) Create(UserProfile profile);
}

public sealed record OrderLineRequest(int ProductId, int Quantity);
public sealed record ShippingAddressRequest(short ProvinceId, string CityName, string? ZipCode,
    string StreetName, string StreetNumber, string? Flat, string? Details);
public sealed record CreateOrderRequest(IReadOnlyList<OrderLineRequest> Items, int PaymentTypeId,
    int DistributionChannelId, ShippingAddressRequest? DeliveryAddress, GuestCustomerRequest? GuestCustomer);
public sealed record GuestCustomerRequest(string FirstName, string LastName, string Email, string? Phone);
public sealed record OrderLineDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice,
    string? ImageUrl);
public sealed record OrderSummary(int OrderId, DateTime CreationDate, DateTime? DeliveryDate,
    int OrderStatusId, string Status, string DistributionChannel, string PaymentType,
    decimal Total, IReadOnlyList<OrderLineDto> Items);
public sealed record CreatedOrder(OrderSummary Order, string? GuestTrackingToken);
public sealed record TrackingStatus(int OrderId, string Status, string? AcceptedText,
    IReadOnlyList<string> NextStatuses);
public sealed record AdvanceOrderRequest(int? StatusId);

public interface IOrderRepository
{
    Task<CreatedOrder> CreateAsync(CreateOrderRequest request, int? authenticatedUserId, CancellationToken ct);
    Task<PagedResult<OrderSummary>> ListForUserAsync(int userId, int page, int pageSize, CancellationToken ct);
    Task<OrderSummary?> GetAsync(int orderId, int? personId, bool isAdmin, CancellationToken ct);
    Task<TrackingStatus?> GetGuestTrackingAsync(int orderId, string token, CancellationToken ct);
    Task<TrackingStatus> AdvanceAsync(int orderId, int actorUserId, int? requestedStatusId, CancellationToken ct);
    Task<DashboardSummary> GetDashboardAsync(CancellationToken ct);
}

public sealed record DashboardSummary(int FinishedOrders, int ActiveProducts, int SoldProducts,
    int ShippedProducts, IReadOnlyList<ProductListItem> TopSelling,
    IReadOnlyList<ProductListItem> TopVisited);
