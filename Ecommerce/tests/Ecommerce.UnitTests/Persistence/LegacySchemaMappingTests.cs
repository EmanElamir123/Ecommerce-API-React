using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Xunit;

namespace Ecommerce.UnitTests.Persistence;

public sealed class LegacySchemaMappingTests
{
    [Fact]
    public void Security_migration_keeps_the_legacy_user_table_and_password_column_name()
    {
        var options = new DbContextOptionsBuilder<EcommerceDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=ignored;Trusted_Connection=True")
            .Options;
        using var db = new EcommerceDbContext(options);
        var user = db.Model.FindEntityType(typeof(User))!;
        var property = user.FindProperty(nameof(User.PasswordHash))!;
        var table = StoreObjectIdentifier.Table("Users", null);

        Assert.Equal("Users", user.GetTableName());
        Assert.Equal("UserPassword", property.GetColumnName(table));
        Assert.Equal(512, property.GetMaxLength());
        Assert.Equal("Products", db.Model.FindEntityType(typeof(Product))!.GetTableName());
    }
}
