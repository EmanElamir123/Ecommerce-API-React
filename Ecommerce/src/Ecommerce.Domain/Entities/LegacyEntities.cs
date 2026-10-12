namespace Ecommerce.Domain.Entities;

public sealed class Brand
{
    public int BrandId { get; set; }
    public bool IsActive { get; set; } = true;
    public string BrandName { get; set; } = string.Empty;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public sealed class Category
{
    public int CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
    public string CategoryName { get; set; } = string.Empty;
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
}

public sealed class Product
{
    public int ProductId { get; set; }
    public bool IsActive { get; set; } = true;
    public string Code { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? ProductDescription { get; set; }
    public decimal Price { get; set; }
    public decimal Cost { get; set; }
    public int Stock { get; set; }
    public int? BrandId { get; set; }
    public int TotalVisits { get; set; }
    public Brand? Brand { get; set; }
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    public ICollection<Image> Images { get; set; } = new List<Image>();
    public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
}

public sealed class ProductCategory
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }
    public Product Product { get; set; } = null!;
    public Category Category { get; set; } = null!;
}

public sealed class FeaturedProduct
{
    public int FeaturedProductId { get; set; }
    public int ProductId { get; set; }
    public int DisplayOrder { get; set; }
    public bool ShowAsNew { get; set; }
    public Product Product { get; set; } = null!;
}

public sealed class Image
{
    public int ImageId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

public sealed class Country
{
    public byte CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;
    public ICollection<Province> Provinces { get; set; } = new List<Province>();
}

public sealed class Province
{
    public short ProvinceId { get; set; }
    public string ProvinceName { get; set; } = string.Empty;
    public byte CountryId { get; set; }
    public Country Country { get; set; } = null!;
    public ICollection<City> Cities { get; set; } = new List<City>();
}

public sealed class City
{
    public short CityId { get; set; }
    public string CityName { get; set; } = string.Empty;
    public string? ZipCode { get; set; }
    public short ProvinceId { get; set; }
    public Province Province { get; set; } = null!;
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
}

public sealed class Address
{
    public int AddressId { get; set; }
    public string StreetName { get; set; } = string.Empty;
    public string StreetNumber { get; set; } = string.Empty;
    public string? Flat { get; set; }
    public string? Details { get; set; }
    public short CityId { get; set; }
    public City City { get; set; } = null!;
}

public sealed class Person
{
    public int PersonId { get; set; }
    public bool IsActive { get; set; } = true;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? TaxCode { get; set; }
    public string? Phone { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateOnly? Birth { get; set; }
    public int? AddressId { get; set; }
    public Address? Address { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public sealed class User
{
    public int UserId { get; set; }
    public string? Username { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public int PersonId { get; set; }
    public Person Person { get; set; } = null!;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public sealed class Role
{
    public byte RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public sealed class UserRole
{
    public int UserId { get; set; }
    public byte RoleId { get; set; }
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}

public sealed class OrderStatus
{
    public int OrderStatusId { get; set; }
    public string OrderStatusName { get; set; } = string.Empty;
    public string TransitionText { get; set; } = string.Empty;
    public string AcceptedText { get; set; } = string.Empty;
    public byte RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ChannelStatus> ChannelStatuses { get; set; } = new List<ChannelStatus>();
}

public sealed class PaymentType
{
    public int PaymentTypeId { get; set; }
    public string PaymentTypeName { get; set; } = string.Empty;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public sealed class DistributionChannel
{
    public int DistributionChannelId { get; set; }
    public string DistributionChannelName { get; set; } = string.Empty;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ChannelStatus> ChannelStatuses { get; set; } = new List<ChannelStatus>();
}

public sealed class ChannelStatus
{
    public int DistributionChannelId { get; set; }
    public int OrderStatusId { get; set; }
    public int OrderStatusIndex { get; set; }
    public DistributionChannel DistributionChannel { get; set; } = null!;
    public OrderStatus OrderStatus { get; set; } = null!;
}

public sealed class Order
{
    public int OrderId { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public int? DeliveryAddressId { get; set; }
    public int OrderStatusId { get; set; }
    public int PersonId { get; set; }
    public int DistributionChannelId { get; set; }
    public int PaymentTypeId { get; set; }
    public Person Person { get; set; } = null!;
    public Address? DeliveryAddress { get; set; }
    public OrderStatus OrderStatus { get; set; } = null!;
    public DistributionChannel DistributionChannel { get; set; } = null!;
    public PaymentType PaymentType { get; set; } = null!;
    public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
}

public sealed class OrderProduct
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
