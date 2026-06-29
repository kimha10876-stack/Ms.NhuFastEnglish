using Microsoft.AspNetCore.Diagnostics;

namespace MsNhuFastEnglishAPI.Infrastructure.Middleware;

public class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IHostEnvironment env) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        httpContext.Response.StatusCode  = StatusCodes.Status500InternalServerError;
        httpContext.Response.ContentType = "application/json";

        object body = env.IsDevelopment()
            ? new { message = exception.Message, detail = exception.ToString() }
            : new { message = "Đã xảy ra lỗi, vui lòng thử lại sau" };

        await httpContext.Response.WriteAsJsonAsync(body, cancellationToken);
        return true;
    }
}
