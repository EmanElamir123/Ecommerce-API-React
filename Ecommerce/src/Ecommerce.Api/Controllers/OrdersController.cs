using Ecommerce.Application.Contracts;
using Ecommerce.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[Route("api/orders")]
public sealed class OrdersController(OrderService orders, IValidator<CreateOrderRequest> validator) : ApiControllerBase
{
    [HttpPost, AllowAnonymous]
    public async Task<IActionResult> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var invalid = await ValidateRequestAsync(request, validator, ct);
        if (invalid is not null) return invalid;
        if (CurrentUserId is null && request.GuestCustomer is null)
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            { [nameof(request.GuestCustomer)] = ["Guest contact details are required when checking out without an account."] }));
        var created = await orders.CreateAsync(request, CurrentUserId, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpGet, Authorize]
    public async Task<IActionResult> Mine([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        (page, pageSize) = ClampPage(page, pageSize);
        return Ok(await orders.ListForUserAsync(CurrentUserId!.Value, page, pageSize, ct));
    }

    [HttpGet("{id:int}"), Authorize]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var result = await orders.GetAsync(id, CurrentPersonId, HasRole("Admin"), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:int}/tracking"), AllowAnonymous]
    public async Task<IActionResult> Track(int id,
        [FromHeader(Name = "X-Order-Tracking-Token")] string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token)) return Unauthorized();
        var result = await orders.GetGuestTrackingAsync(id, token, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:int}/status"), Authorize]
    public async Task<IActionResult> Advance(int id, AdvanceOrderRequest request, CancellationToken ct)
    {
        var result = await orders.AdvanceAsync(id, CurrentUserId!.Value, request.StatusId, ct);
        return Ok(result);
    }
}
