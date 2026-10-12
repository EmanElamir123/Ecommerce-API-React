using Ecommerce.Application.Contracts;
using Ecommerce.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Ecommerce.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController(AuthService auth, IValidator<RegisterRequest> registerValidator,
    IValidator<LoginRequest> loginValidator, IValidator<ChangePasswordRequest> passwordChangeValidator) : ApiControllerBase
{
    [HttpPost("register"), AllowAnonymous, EnableRateLimiting("auth")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        var invalid = await ValidateRequestAsync(request, registerValidator, ct);
        if (invalid is not null) return invalid;
        var response = await auth.RegisterAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("auth")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var invalid = await ValidateRequestAsync(request, loginValidator, ct);
        if (invalid is not null) return invalid;
        return Ok(await auth.LoginAsync(request, ct));
    }

    [HttpPost("change-password"), Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        var invalid = await ValidateRequestAsync(request, passwordChangeValidator, ct);
        if (invalid is not null) return invalid;
        await auth.ChangePasswordAsync(CurrentUserId!.Value, request, ct);
        return NoContent();
    }
}
