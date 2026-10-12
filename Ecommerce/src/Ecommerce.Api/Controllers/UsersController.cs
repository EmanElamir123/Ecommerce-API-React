using Ecommerce.Application.Contracts;
using Ecommerce.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[Route("api/users")]
public sealed class UsersController(IIdentityRepository users) : ApiControllerBase
{
    [HttpGet("me"), Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var profile = await users.GetProfileAsync(CurrentUserId!.Value, ct);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut("me"), Authorize]
    public async Task<IActionResult> UpdateMe(UpdateProfileRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || request.FirstName.Trim().Length > 30 ||
            string.IsNullOrWhiteSpace(request.LastName) || request.LastName.Trim().Length > 30 || request.Phone?.Length > 30)
            return BadRequest(new ProblemDetails { Title = "Invalid profile values.", Status = 400 });
        return await users.UpdateProfileAsync(CurrentUserId!.Value, request, ct) ? NoContent() : NotFound();
    }

    [HttpGet, Authorize(Policy = "Admin")]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await users.ListUsersAsync(ct));

    [HttpPut("{id:int}/roles"), Authorize(Policy = "Admin")]
    public async Task<IActionResult> UpdateRoles(int id, UpdateRolesRequest request, CancellationToken ct)
    {
        if (request.RoleIds.Count > 10) return BadRequest(new ProblemDetails { Title = "Too many roles.", Status = 400 });
        return await users.UpdateRolesAsync(id, request.RoleIds, CurrentUserId!.Value, ct) ? NoContent() : NotFound();
    }
}
