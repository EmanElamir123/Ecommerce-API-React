using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ecommerce.Infrastructure.Persistence;

public sealed class EcommerceDbContextFactory : IDesignTimeDbContextFactory<EcommerceDbContext>
{
    public EcommerceDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Ecommerce")
            ?? "Server=localhost;Database=ecommerce_net_db;Integrated Security=True;Encrypt=True;TrustServerCertificate=True";
        var options = new DbContextOptionsBuilder<EcommerceDbContext>().UseSqlServer(connectionString).Options;
        return new EcommerceDbContext(options);
    }
}
