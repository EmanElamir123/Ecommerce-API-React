using Ecommerce.Application.Contracts;
using Ecommerce.Application.Common;
using Ecommerce.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[Route("api/categories")]
public sealed class CategoriesController(CatalogService catalog) : ApiControllerBase
{
    [HttpGet, AllowAnonymous]
    public Task<PagedResult<CatalogItem>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null, [FromQuery] bool includeInactive = false, CancellationToken ct = default)
    {
        (page, pageSize) = ClampPage(page, pageSize);
        return catalog.ListCategoriesAsync(new(page, pageSize, search, HasRole("Admin") && includeInactive), ct);
    }

    [HttpPost, Authorize(Policy = "Admin")]
    public async Task<IActionResult> Create([FromBody] CatalogNameRequest request, CancellationToken ct)
    {
        var name = ValidateName(request.Name);
        var id = await catalog.CreateCategoryAsync(name, ct);
        return CreatedAtAction(nameof(List), new { id }, new { id, name });
    }

    [HttpPut("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Update(int id, CatalogUpdateRequest request, CancellationToken ct) =>
        await catalog.UpdateCategoryAsync(id, ValidateName(request.Name), request.IsActive, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await catalog.DeactivateCategoryAsync(id, ct) ? NoContent() : NotFound();

    private static string ValidateName(string name) => !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= 30
        ? name.Trim() : throw new ArgumentException("Name is required and may contain at most 30 characters.");
}

[Route("api/brands")]
public sealed class BrandsController(CatalogService catalog) : ApiControllerBase
{
    [HttpGet, AllowAnonymous]
    public Task<PagedResult<CatalogItem>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null, [FromQuery] bool includeInactive = false, CancellationToken ct = default)
    {
        (page, pageSize) = ClampPage(page, pageSize);
        return catalog.ListBrandsAsync(new(page, pageSize, search, HasRole("Admin") && includeInactive), ct);
    }

    [HttpPost, Authorize(Policy = "Admin")]
    public async Task<IActionResult> Create([FromBody] CatalogNameRequest request, CancellationToken ct)
    {
        var name = ValidateName(request.Name); var id = await catalog.CreateBrandAsync(name, ct);
        return CreatedAtAction(nameof(List), new { id }, new { id, name });
    }

    [HttpPut("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Update(int id, CatalogUpdateRequest request, CancellationToken ct) =>
        await catalog.UpdateBrandAsync(id, ValidateName(request.Name), request.IsActive, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await catalog.DeactivateBrandAsync(id, ct) ? NoContent() : NotFound();

    private static string ValidateName(string name) => !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= 30
        ? name.Trim() : throw new ArgumentException("Name is required and may contain at most 30 characters.");
}

public sealed record CatalogNameRequest(string Name);
public sealed record CatalogUpdateRequest(string Name, bool IsActive);
