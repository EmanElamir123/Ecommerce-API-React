using System.Security.Cryptography;
using System.Text;
using Ecommerce.Application.Common;
using Ecommerce.Application.Contracts;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Repositories;

public sealed class OrderRepository(EcommerceDbContext db) : IOrderRepository
{
    public async Task<CreatedOrder> CreateAsync(CreateOrderRequest request, int? authenticatedUserId, CancellationToken ct)
    {
        if (authenticatedUserId is null && request.GuestCustomer is null)
            throw new ArgumentException("Guest details are required when checking out without an account.");
        var channelId = request.DistributionChannelId;
        var paymentAllowed = channelId is 1 or 2 ? request.PaymentTypeId is 2 or 3 :
            channelId is 3 or 4 && request.PaymentTypeId == 1;
        if (!paymentAllowed) throw new ArgumentException("The selected payment type does not match the distribution channel.");
        var ships = channelId is 1 or 4;
        if (ships != (request.DeliveryAddress is not null))
            throw new ArgumentException("A delivery address is required for shipping channels and must be omitted for pickup channels.");
        var normalizedLines = request.Items.GroupBy(x => x.ProductId)
            .Select(g => new OrderLineRequest(g.Key, g.Sum(x => x.Quantity))).ToArray();
        if (normalizedLines.Any(x => x.Quantity is < 1 or > 100))
            throw new ArgumentException("Combined item quantity must be between 1 and 100.");

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            int personId;
            if (authenticatedUserId.HasValue)
            {
                personId = await db.Users.Where(x => x.UserId == authenticatedUserId.Value && x.Person.IsActive)
                    .Select(x => x.PersonId).SingleOrDefaultAsync(ct);
                if (personId == 0) throw new NotFoundException("Authenticated user was not found.");
            }
            else
            {
                var guest = request.GuestCustomer!;
                var person = await db.People.SingleOrDefaultAsync(x => x.Email == guest.Email.Trim(), ct);
                if (person is not null && await db.Users.AnyAsync(x => x.PersonId == person.PersonId, ct))
                    throw new ConflictException("Sign in before placing an order with an account email address.");
                if (person is null)
                {
                    person = new Person { FirstName = guest.FirstName.Trim(), LastName = guest.LastName.Trim(),
                        Email = guest.Email.Trim(), Phone = guest.Phone?.Trim(), IsActive = true };
                    db.People.Add(person);
                    await db.SaveChangesAsync(ct);
                }
                personId = person.PersonId;
            }

            var addressId = request.DeliveryAddress is null ? (int?)null : await ResolveAddressAsync(request.DeliveryAddress, ct);
            if (!await db.PaymentTypes.AnyAsync(x => x.PaymentTypeId == request.PaymentTypeId, ct) ||
                !await db.DistributionChannels.AnyAsync(x => x.DistributionChannelId == channelId, ct))
                throw new ArgumentException("Payment type or distribution channel does not exist.");
            var initialStatusId = channelId switch { 1 or 2 => LegacyOrderStatuses.ProcessingPayment,
                3 => LegacyOrderStatuses.PaymentAndWithdrawalPending, _ => LegacyOrderStatuses.DeliveryAndPaymentPending };
            if (!await db.ChannelStatuses.AnyAsync(x => x.DistributionChannelId == channelId && x.OrderStatusId == initialStatusId, ct))
                throw new InvalidOperationException("Initial order status is not configured for this distribution channel.");

            var productIds = normalizedLines.Select(x => x.ProductId).ToArray();
            var products = await db.Products.AsNoTracking().Where(x => productIds.Contains(x.ProductId) && x.IsActive)
                .Select(x => new { x.ProductId, x.ProductName, x.Price }).ToDictionaryAsync(x => x.ProductId, ct);
            if (products.Count != productIds.Length) throw new NotFoundException("One or more products are unavailable.");
            foreach (var line in normalizedLines)
            {
                var affected = await db.Products.Where(x => x.ProductId == line.ProductId && x.IsActive && x.Stock >= line.Quantity)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.Stock, x => x.Stock - line.Quantity), ct);
                if (affected == 0) throw new ConflictException($"Insufficient stock for product {line.ProductId}.");
            }
            var order = new Order { PersonId = personId, DeliveryAddressId = addressId,
                OrderStatusId = initialStatusId, DistributionChannelId = channelId,
                PaymentTypeId = request.PaymentTypeId, CreationDate = DateTime.Now };
            foreach (var line in normalizedLines)
                order.OrderProducts.Add(new OrderProduct { ProductId = line.ProductId, Quantity = line.Quantity });
            db.Orders.Add(order);
            await db.SaveChangesAsync(ct);
            string? guestToken = null;
            if (authenticatedUserId is null)
            {
                guestToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
                db.GuestOrderTokens.Add(new GuestOrderToken { OrderId = order.OrderId, TokenHash = SHA256.HashData(Encoding.UTF8.GetBytes(guestToken)), CreatedAtUtc = DateTime.UtcNow });
                await db.SaveChangesAsync(ct);
            }
            await tx.CommitAsync(ct);
            var summary = await QuerySummary().SingleAsync(x => x.OrderId == order.OrderId, ct);
            return new CreatedOrder(summary, guestToken);
        });
    }

    public async Task<PagedResult<OrderSummary>> ListForUserAsync(int userId, int page, int pageSize, CancellationToken ct)
    {
        var personId = await db.Users.Where(x => x.UserId == userId).Select(x => (int?)x.PersonId).SingleOrDefaultAsync(ct);
        if (personId is null) throw new NotFoundException("User account was not found.");
        var query = QuerySummary().Where(x => db.Orders.Any(o => o.OrderId == x.OrderId && o.PersonId == personId));
        var count = await query.CountAsync(ct);
        var items = await query.OrderByDescending(x => x.CreationDate).ThenByDescending(x => x.OrderId)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new(items, page, pageSize, count);
    }

    public Task<OrderSummary?> GetAsync(int orderId, int? personId, bool isAdmin, CancellationToken ct)
    {
        var query = QuerySummary().Where(x => x.OrderId == orderId);
        if (!isAdmin)
        {
            if (!personId.HasValue) return Task.FromResult<OrderSummary?>(null);
            query = query.Where(x => db.Orders.Any(o => o.OrderId == x.OrderId && o.PersonId == personId.Value));
        }
        return query.SingleOrDefaultAsync(ct);
    }

    public async Task<TrackingStatus?> GetGuestTrackingAsync(int orderId, string token, CancellationToken ct)
    {
        var entry = await db.GuestOrderTokens.AsNoTracking().Include(x => x.Order).ThenInclude(x => x.OrderStatus)
            .SingleOrDefaultAsync(x => x.OrderId == orderId, ct);
        if (entry is null) return null;
        var suppliedHash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        if (!CryptographicOperations.FixedTimeEquals(entry.TokenHash, suppliedHash)) return null;
        return await BuildTrackingAsync(entry.Order, ct);
    }

    public async Task<TrackingStatus> AdvanceAsync(int orderId, int actorUserId, int? requestedStatusId, CancellationToken ct)
    {
        var roles = await db.UserRoles.AsNoTracking().Where(x => x.UserId == actorUserId && x.User.Person.IsActive)
            .Select(x => x.Role.RoleName).ToListAsync(ct);
        var order = await db.Orders.Include(x => x.OrderStatus).ThenInclude(x => x.Role).SingleOrDefaultAsync(x => x.OrderId == orderId, ct)
            ?? throw new NotFoundException("Order was not found.");
        var statuses = await db.ChannelStatuses.AsNoTracking().Include(x => x.OrderStatus)
            .Where(x => x.DistributionChannelId == order.DistributionChannelId).OrderBy(x => x.OrderStatusIndex).ToListAsync(ct);
        var currentIndex = statuses.FindIndex(x => x.OrderStatusId == order.OrderStatusId);
        if (currentIndex < 0 || currentIndex == statuses.Count - 1) throw new ConflictException("The order has no further configured status transition.");
        var isPlus = roles.Contains("Plus", StringComparer.OrdinalIgnoreCase);
        int nextStatusId;
        if (isPlus && requestedStatusId.HasValue)
        {
            if (!statuses.Any(x => x.OrderStatusId == requestedStatusId.Value))
                throw new ArgumentException("The requested status is not valid for this distribution channel.");
            nextStatusId = requestedStatusId.Value;
        }
        else
        {
            if (!roles.Contains(order.OrderStatus.Role.RoleName, StringComparer.OrdinalIgnoreCase))
                throw new ForbiddenException("Your role cannot advance this order.");
            nextStatusId = statuses[currentIndex + 1].OrderStatusId;
        }
        var changed = await db.Orders.Where(x => x.OrderId == orderId && x.OrderStatusId == order.OrderStatusId)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.OrderStatusId, nextStatusId), ct);
        if (changed == 0) throw new ConflictException("The order status changed concurrently. Reload and try again.");
        var updated = await db.Orders.Include(x => x.OrderStatus).ThenInclude(x => x.Role).SingleAsync(x => x.OrderId == orderId, ct);
        return await BuildTrackingAsync(updated, ct);
    }

    public async Task<DashboardSummary> GetDashboardAsync(CancellationToken ct)
    {
        var finished = await db.Orders.CountAsync(x => x.OrderStatusId == LegacyOrderStatuses.OrderCompleted, ct);
        var active = await db.Products.CountAsync(x => x.IsActive, ct);
        var sold = await db.OrderProducts.Where(x => x.Order.OrderStatusId == LegacyOrderStatuses.OrderCompleted).SumAsync(x => (int?)x.Quantity, ct) ?? 0;
        var shipped = await db.OrderProducts.Where(x => x.Order.OrderStatusId == LegacyOrderStatuses.OrderCompleted &&
            (x.Order.DistributionChannelId == 1 || x.Order.DistributionChannelId == 4)).SumAsync(x => (int?)x.Quantity, ct) ?? 0;
        var topSelling = await db.OrderProducts.AsNoTracking().Where(x => x.Order.OrderStatusId == LegacyOrderStatuses.OrderCompleted)
            .GroupBy(x => x.Product).OrderByDescending(g => g.Sum(p => p.Quantity)).Take(10)
            .Select(g => new ProductListItem(g.Key.ProductId, g.Key.Code, g.Key.ProductName, g.Key.ProductDescription,
                g.Key.Price, g.Key.Stock, g.Key.Brand == null ? null : g.Key.Brand.BrandName,
                g.Key.ProductCategories.Select(c => c.Category.CategoryName).OrderBy(n => n).ToList(),
                g.Key.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).FirstOrDefault())).ToListAsync(ct);
        var topVisited = await db.Products.AsNoTracking().Where(x => x.IsActive && x.TotalVisits > 0)
            .OrderByDescending(x => x.TotalVisits).ThenBy(x => x.ProductId).Take(10)
            .Select(x => new ProductListItem(x.ProductId, x.Code, x.ProductName, x.ProductDescription,
                x.Price, x.Stock, x.Brand == null ? null : x.Brand.BrandName,
                x.ProductCategories.Select(c => c.Category.CategoryName).OrderBy(n => n).ToList(),
                x.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).FirstOrDefault())).ToListAsync(ct);
        return new(finished, active, sold, shipped, topSelling, topVisited);
    }

    private IQueryable<OrderSummary> QuerySummary() => db.Orders.AsNoTracking().Select(o => new OrderSummary(
        o.OrderId, o.CreationDate, o.DeliveryDate, o.OrderStatusId, o.OrderStatus.OrderStatusName,
        o.DistributionChannel.DistributionChannelName, o.PaymentType.PaymentTypeName,
        o.OrderProducts.Sum(p => p.Product.Price * p.Quantity),
        o.OrderProducts.OrderBy(p => p.ProductId).Select(p => new OrderLineDto(p.ProductId,
            p.Product.ProductName, p.Quantity, p.Product.Price,
            p.Product.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).FirstOrDefault())).ToList()));

    private async Task<int> ResolveAddressAsync(ShippingAddressRequest input, CancellationToken ct)
    {
        if (!await db.Provinces.AnyAsync(x => x.ProvinceId == input.ProvinceId, ct))
            throw new ArgumentException("The selected province does not exist.");
        var city = await db.Cities.SingleOrDefaultAsync(x => x.ProvinceId == input.ProvinceId && x.CityName == input.CityName.Trim(), ct);
        if (city is null)
        {
            city = new City { ProvinceId = input.ProvinceId, CityName = input.CityName.Trim(), ZipCode = input.ZipCode?.Trim() };
            db.Cities.Add(city); await db.SaveChangesAsync(ct);
        }
        else if (!string.IsNullOrWhiteSpace(input.ZipCode)) city.ZipCode = input.ZipCode.Trim();
        var address = await db.Addresses.SingleOrDefaultAsync(x => x.CityId == city.CityId &&
            x.StreetName == input.StreetName.Trim() && x.StreetNumber == input.StreetNumber.Trim(), ct);
        if (address is null)
        {
            address = new Address { CityId = city.CityId, StreetName = input.StreetName.Trim(),
                StreetNumber = input.StreetNumber.Trim(), Flat = input.Flat?.Trim(), Details = input.Details?.Trim() };
            db.Addresses.Add(address); await db.SaveChangesAsync(ct);
        }
        else { address.Flat = input.Flat?.Trim(); address.Details = input.Details?.Trim(); }
        return address.AddressId;
    }

    private async Task<TrackingStatus> BuildTrackingAsync(Order order, CancellationToken ct)
    {
        var statuses = await db.ChannelStatuses.AsNoTracking().Include(x => x.OrderStatus)
            .Where(x => x.DistributionChannelId == order.DistributionChannelId).OrderBy(x => x.OrderStatusIndex).ToListAsync(ct);
        var index = statuses.FindIndex(x => x.OrderStatusId == order.OrderStatusId);
        var next = index >= 0 && index + 1 < statuses.Count ? statuses.Skip(index + 1).Select(x => x.OrderStatus.OrderStatusName).ToArray() : [];
        var current = statuses.FirstOrDefault(x => x.OrderStatusId == order.OrderStatusId)?.OrderStatus;
        return new TrackingStatus(order.OrderId, order.OrderStatus.OrderStatusName, current?.AcceptedText, next);
    }
}
