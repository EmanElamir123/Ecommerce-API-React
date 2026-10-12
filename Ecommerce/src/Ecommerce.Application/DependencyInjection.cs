using Ecommerce.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<AuthService>();
        services.AddScoped<CatalogService>();
        services.AddScoped<OrderService>();
        return services;
    }
}
