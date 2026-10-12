using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence;

public sealed class EcommerceDbContext(DbContextOptions<EcommerceDbContext> options) : DbContext(options)
{
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<FeaturedProduct> FeaturedProducts => Set<FeaturedProduct>();
    public DbSet<Image> Images => Set<Image>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<OrderStatus> OrderStatuses => Set<OrderStatus>();
    public DbSet<PaymentType> PaymentTypes => Set<PaymentType>();
    public DbSet<DistributionChannel> DistributionChannels => Set<DistributionChannel>();
    public DbSet<ChannelStatus> ChannelStatuses => Set<ChannelStatus>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderProduct> OrderProducts => Set<OrderProduct>();
    public DbSet<GuestOrderToken> GuestOrderTokens => Set<GuestOrderToken>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Brand>(e => { e.ToTable("Brands"); e.HasKey(x => x.BrandId); e.Property(x => x.BrandName).HasMaxLength(30).IsUnicode(false).IsRequired(); e.HasIndex(x => x.BrandName).IsUnique(); e.Property(x => x.IsActive).HasDefaultValue(true); });
        model.Entity<Category>(e => { e.ToTable("Categories"); e.HasKey(x => x.CategoryId); e.Property(x => x.CategoryName).HasMaxLength(30).IsUnicode(false).IsRequired(); e.HasIndex(x => x.CategoryName).IsUnique(); e.Property(x => x.IsActive).HasDefaultValue(true); });
        model.Entity<Product>(e => { e.ToTable("Products", t => t.HasCheckConstraint("CK_Products_Stock_NonNegative", "[Stock] >= 0")); e.HasKey(x => x.ProductId); e.Property(x => x.Code).HasMaxLength(50).IsUnicode(false).IsRequired(); e.HasIndex(x => x.Code).IsUnique(); e.Property(x => x.ProductName).HasMaxLength(50).IsUnicode(false).IsRequired(); e.Property(x => x.ProductDescription).HasMaxLength(300).IsUnicode(false); e.Property(x => x.Price).HasColumnType("money"); e.Property(x => x.Cost).HasColumnType("money"); e.Property(x => x.TotalVisits).HasDefaultValue(0); e.HasOne(x => x.Brand).WithMany(x => x.Products).HasForeignKey(x => x.BrandId).OnDelete(DeleteBehavior.NoAction); e.HasIndex(x => new { x.IsActive, x.ProductName }).HasDatabaseName("IX_Products_IsActive_ProductName"); });
        model.Entity<ProductCategory>(e => { e.ToTable("ProductCategories"); e.HasKey(x => new { x.ProductId, x.CategoryId }); e.HasOne(x => x.Product).WithMany(x => x.ProductCategories).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.Category).WithMany(x => x.ProductCategories).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.NoAction); e.HasIndex(x => x.CategoryId); });
        model.Entity<FeaturedProduct>(e => { e.ToTable("FeaturedProducts"); e.HasKey(x => x.FeaturedProductId); e.HasIndex(x => x.ProductId).IsUnique(); e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<Image>(e => { e.ToTable("Images"); e.HasKey(x => x.ImageId); e.Property(x => x.ImageUrl).HasMaxLength(300).IsUnicode(false).IsRequired(); e.HasOne(x => x.Product).WithMany(x => x.Images).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction); e.HasIndex(x => x.ProductId); });
        model.Entity<Country>(e => { e.ToTable("Countries"); e.HasKey(x => x.CountryId); e.Property(x => x.CountryName).HasMaxLength(30).IsUnicode(false); e.HasIndex(x => x.CountryName).IsUnique(); });
        model.Entity<Province>(e => { e.ToTable("Provinces"); e.HasKey(x => x.ProvinceId); e.Property(x => x.ProvinceName).HasMaxLength(30).IsUnicode(false); e.HasIndex(x => new { x.ProvinceName, x.CountryId }).IsUnique(); e.HasOne(x => x.Country).WithMany(x => x.Provinces).HasForeignKey(x => x.CountryId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<City>(e => { e.ToTable("Cities"); e.HasKey(x => x.CityId); e.Property(x => x.CityName).HasMaxLength(30).IsUnicode(false); e.Property(x => x.ZipCode).HasMaxLength(30).IsUnicode(false); e.HasIndex(x => new { x.CityName, x.ProvinceId }).IsUnique(); e.HasOne(x => x.Province).WithMany(x => x.Cities).HasForeignKey(x => x.ProvinceId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<Address>(e => { e.ToTable("Addresses"); e.HasKey(x => x.AddressId); e.Property(x => x.StreetName).HasMaxLength(30).IsUnicode(false); e.Property(x => x.StreetNumber).HasMaxLength(10).IsUnicode(false); e.Property(x => x.Flat).HasMaxLength(30).IsUnicode(false); e.Property(x => x.Details).HasMaxLength(300).IsUnicode(false); e.HasIndex(x => new { x.StreetName, x.StreetNumber, x.CityId }).IsUnique(); e.HasOne(x => x.City).WithMany(x => x.Addresses).HasForeignKey(x => x.CityId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<Person>(e => { e.ToTable("People"); e.HasKey(x => x.PersonId); e.Property(x => x.FirstName).HasMaxLength(30).IsUnicode(false); e.Property(x => x.LastName).HasMaxLength(30).IsUnicode(false); e.Property(x => x.TaxCode).HasMaxLength(30).IsUnicode(false); e.Property(x => x.Phone).HasMaxLength(30).IsUnicode(false); e.Property(x => x.Email).HasMaxLength(30).IsUnicode(false).IsRequired(); e.HasIndex(x => x.Email).IsUnique(); e.Property(x => x.IsActive).HasDefaultValue(true); e.HasOne(x => x.Address).WithMany().HasForeignKey(x => x.AddressId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<User>(e => { e.ToTable("Users"); e.HasKey(x => x.UserId); e.Property(x => x.Username).HasMaxLength(30).IsUnicode(false); e.Property(x => x.PasswordHash).HasColumnName("UserPassword").HasMaxLength(512).IsUnicode(false).IsRequired(); e.HasOne(x => x.Person).WithMany().HasForeignKey(x => x.PersonId).OnDelete(DeleteBehavior.NoAction); e.HasIndex(x => x.PersonId); });
        model.Entity<Role>(e => { e.ToTable("Roles"); e.HasKey(x => x.RoleId); e.Property(x => x.RoleName).HasMaxLength(50).IsUnicode(false).IsRequired(); });
        model.Entity<UserRole>(e => { e.ToTable("UserRoles"); e.HasKey(x => new { x.UserId, x.RoleId }); e.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<OrderStatus>(e => { e.ToTable("OrderStatuses"); e.HasKey(x => x.OrderStatusId); e.Property(x => x.OrderStatusName).HasMaxLength(30).IsUnicode(false); e.Property(x => x.TransitionText).HasMaxLength(50).IsUnicode(false); e.Property(x => x.AcceptedText).HasMaxLength(50).IsUnicode(false); e.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<PaymentType>(e => { e.ToTable("PaymentTypes"); e.HasKey(x => x.PaymentTypeId); e.Property(x => x.PaymentTypeName).HasMaxLength(30).IsUnicode(false); });
        model.Entity<DistributionChannel>(e => { e.ToTable("DistributionChannels"); e.HasKey(x => x.DistributionChannelId); e.Property(x => x.DistributionChannelName).HasMaxLength(50).IsUnicode(false); });
        model.Entity<ChannelStatus>(e => { e.ToTable("ChannelStatuses"); e.HasKey(x => new { x.DistributionChannelId, x.OrderStatusId }); e.HasOne(x => x.DistributionChannel).WithMany(x => x.ChannelStatuses).HasForeignKey(x => x.DistributionChannelId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.OrderStatus).WithMany(x => x.ChannelStatuses).HasForeignKey(x => x.OrderStatusId).OnDelete(DeleteBehavior.NoAction); });
        model.Entity<Order>(e => { e.ToTable("Orders"); e.HasKey(x => x.OrderId); e.Property(x => x.CreationDate).HasDefaultValueSql("getdate()"); e.HasOne(x => x.Person).WithMany(x => x.Orders).HasForeignKey(x => x.PersonId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.DeliveryAddress).WithMany().HasForeignKey(x => x.DeliveryAddressId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.OrderStatus).WithMany(x => x.Orders).HasForeignKey(x => x.OrderStatusId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.DistributionChannel).WithMany(x => x.Orders).HasForeignKey(x => x.DistributionChannelId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.PaymentType).WithMany(x => x.Orders).HasForeignKey(x => x.PaymentTypeId).OnDelete(DeleteBehavior.NoAction); e.HasIndex(x => new { x.PersonId, x.CreationDate }); e.HasIndex(x => new { x.OrderStatusId, x.CreationDate }); });
        model.Entity<OrderProduct>(e => { e.ToTable("OrderProducts"); e.HasKey(x => new { x.OrderId, x.ProductId }); e.Property(x => x.Quantity).HasDefaultValue(1); e.HasOne(x => x.Order).WithMany(x => x.OrderProducts).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.NoAction); e.HasOne(x => x.Product).WithMany(x => x.OrderProducts).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction); e.HasIndex(x => x.ProductId); });
        model.Entity<GuestOrderToken>(e => { e.ToTable("GuestOrderTokens"); e.HasKey(x => x.OrderId); e.Property(x => x.TokenHash).HasMaxLength(32).IsFixedLength(); e.HasOne(x => x.Order).WithOne().HasForeignKey<GuestOrderToken>(x => x.OrderId).OnDelete(DeleteBehavior.NoAction); });
    }
}

public sealed class GuestOrderToken
{
    public int OrderId { get; set; }
    public byte[] TokenHash { get; set; } = [];
    public DateTime CreatedAtUtc { get; set; }
    public Order Order { get; set; } = null!;
}
