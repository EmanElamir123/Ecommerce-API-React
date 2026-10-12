using Ecommerce.Application.Contracts;
using Ecommerce.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[Route("api/featured-products")]
public sealed class FeaturedController(CatalogService catalog) : ApiControllerBase
{
    [HttpGet, AllowAnonymous]
    public Task<IReadOnlyList<FeaturedItem>> List(CancellationToken ct) => catalog.ListFeaturedAsync(ct);

    [HttpPut, Authorize(Policy = "Admin")]
    public async Task<IActionResult> Set([FromBody] IReadOnlyList<SetFeaturedRequest> items, CancellationToken ct)
    {
        if (items.Count > 20) return BadRequest(new ProblemDetails { Title = "Too many featured products.", Status = 400 });
        await catalog.SetFeaturedAsync(items, ct);
        return NoContent();
    }
}
