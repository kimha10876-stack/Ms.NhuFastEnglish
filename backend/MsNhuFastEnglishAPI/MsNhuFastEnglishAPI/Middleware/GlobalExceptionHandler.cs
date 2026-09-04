using Microsoft.AspNetCore.Diagnostics;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Middleware;

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
            ? new { code = 500, message = exception.Message, detail = exception.ToString() }
            : (object)ApiResponse.ServerError("Đã xảy ra lỗi, vui lòng thử lại sau");

        await httpContext.Response.WriteAsJsonAsync(body, cancellationToken);
        return true;
    }
}
