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
        var statusCode = exception switch
        {
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            AccessViolationException => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            logger.LogWarning("Auth failure (Status {Status}): {Message}", statusCode, exception.Message);
        }

        httpContext.Response.StatusCode  = statusCode;
        httpContext.Response.ContentType = "application/json";

        object body;
        if (statusCode == StatusCodes.Status401Unauthorized)
        {
            body = ApiResponse.Unauthorized(exception.Message);
        }
        else if (statusCode == StatusCodes.Status403Forbidden)
        {
            body = ApiResponse.Forbidden(exception.Message);
        }
        else
        {
            body = env.IsDevelopment()
                ? new { code = 500, message = exception.Message, detail = exception.ToString() }
                : (object)ApiResponse.ServerError("Đã xảy ra lỗi, vui lòng thử lại sau");
        }

        await httpContext.Response.WriteAsJsonAsync(body, cancellationToken);
        return true;
    }
}
