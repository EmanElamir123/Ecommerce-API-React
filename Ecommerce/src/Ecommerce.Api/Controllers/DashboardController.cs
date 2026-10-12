using Ecommerce.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[Route("api/dashboard"), Authorize(Policy = "BackOffice")]
public sealed class DashboardController(OrderService orders) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Summary(CancellationToken ct) => Ok(await orders.GetDashboardAsync(ct));
}
