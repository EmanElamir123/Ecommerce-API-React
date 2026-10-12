using Ecommerce.Application.Contracts;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Repositories;
using Ecommerce.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Ecommerce")
            ?? throw new InvalidOperationException("ConnectionStrings:Ecommerce is required.");
        services.AddDbContext<EcommerceDbContext>(options => options.UseSqlServer(connectionString,
            sql => sql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null)));
        services.AddScoped<ICatalogRepository, CatalogRepository>();
        services.AddScoped<IIdentityRepository, IdentityRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddSingleton<IPasswordService, PasswordService>();
        services.AddHealthChecks().AddDbContextCheck<EcommerceDbContext>("sql-server");
        return services;
    }
}
