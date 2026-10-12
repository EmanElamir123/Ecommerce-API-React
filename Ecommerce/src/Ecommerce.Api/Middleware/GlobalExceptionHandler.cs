using Ecommerce.Application.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "Unauthorized", "The supplied credentials are invalid."),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", exception.Message),
            NotFoundException => (StatusCodes.Status404NotFound, "Not Found", exception.Message),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict", exception.Message),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request", exception.Message),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Not Found", exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Server error", "The request could not be completed.")
        };
        if (status >= 500) logger.LogError(exception, "Unhandled request failure. TraceId {TraceId}", httpContext.TraceIdentifier);
        else logger.LogInformation("Request rejected with status {StatusCode}. TraceId {TraceId}", status, httpContext.TraceIdentifier);
        httpContext.Response.StatusCode = status;
        var problem = new ProblemDetails
        {
            Status = status, Title = title, Detail = detail,
            Type = $"https://httpstatuses.com/{status}", Instance = httpContext.Request.Path
        };
        problem.Extensions["traceId"] = httpContext.TraceIdentifier;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        { HttpContext = httpContext, ProblemDetails = problem, Exception = exception });
    }
}
