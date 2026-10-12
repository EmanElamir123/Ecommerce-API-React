using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int? CurrentUserId => int.TryParse(User.FindFirstValue("user_id"), out var value) ? value : null;
    protected int? CurrentPersonId => int.TryParse(User.FindFirstValue("person_id"), out var value) ? value : null;
    protected bool HasRole(string role) => User.IsInRole(role);

    protected async Task<IActionResult?> ValidateRequestAsync<T>(T model, IValidator<T> validator, CancellationToken ct)
    {
        var result = await validator.ValidateAsync(model, ct);
        if (result.IsValid) return null;
        var errors = result.Errors.GroupBy(x => x.PropertyName).ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
        return BadRequest(new ValidationProblemDetails(errors) { Status = StatusCodes.Status400BadRequest, Title = "Request validation failed." });
    }

    protected static (int Page, int PageSize) ClampPage(int page, int pageSize) =>
        (Math.Max(1, page), Math.Clamp(pageSize, 1, 100));
}
