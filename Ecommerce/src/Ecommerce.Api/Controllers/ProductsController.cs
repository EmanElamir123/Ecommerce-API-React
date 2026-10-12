using Ecommerce.Application.Contracts;
using Ecommerce.Application.Common;
using FluentValidation;
using Ecommerce.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[Route("api/products")]
public sealed class ProductsController(CatalogService catalog, IValidator<SaveProductRequest> validator) : ApiControllerBase
{
    [HttpGet, AllowAnonymous]
    public async Task<ActionResult<PagedResult<ProductListItem>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 24,
        [FromQuery] string? search = null, [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null, [FromQuery] bool? inStock = null,
        [FromQuery] string sortBy = "name", [FromQuery] bool descending = false,
        [FromQuery] bool includeInactive = false, CancellationToken ct = default)
    {
        (page, pageSize) = ClampPage(page, pageSize);
        if (!HasRole("Admin")) includeInactive = false;
        if (search?.Length > 100) throw new ArgumentException("Search text cannot exceed 100 characters.");
        return Ok(await catalog.ListProductsAsync(new ProductQuery(page, pageSize, search, categoryId,
            brandId, inStock, sortBy, descending, includeInactive), ct));
    }

    [HttpGet("{id:int}"), AllowAnonymous]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        if (id <= 0) return NotFound();
        var product = await catalog.GetProductAsync(id, ct);
        if (product is null) return NotFound();
        await catalog.IncrementVisitAsync(id, ct);
        return Ok(product);
    }

    [HttpGet("{id:int}/admin"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> GetAdmin(int id, CancellationToken ct)
    {
        var product = await catalog.GetAdminProductAsync(id, ct);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost, Authorize(Policy = "Admin")]
    public async Task<IActionResult> Create(SaveProductRequest request, CancellationToken ct)
    {
        var invalid = await ValidateRequestAsync(request, validator, ct);
        if (invalid is not null) return invalid;
        var id = await catalog.CreateProductAsync(request, ct);
        return CreatedAtAction(nameof(GetAdmin), new { id }, new { id });
    }

    [HttpPut("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Update(int id, SaveProductRequest request, CancellationToken ct)
    {
        var invalid = await ValidateRequestAsync(request, validator, ct);
        if (invalid is not null) return invalid;
        return await catalog.UpdateProductAsync(id, request, ct) ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await catalog.DeactivateProductAsync(id, ct) ? NoContent() : NotFound();
}
