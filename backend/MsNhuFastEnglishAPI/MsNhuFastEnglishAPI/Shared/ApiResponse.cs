namespace MsNhuFastEnglishAPI.Shared;

public class ApiResponse<T>
{
    public int     Code    { get; init; }
    public string  Message { get; init; } = string.Empty;
    public T?      Data    { get; init; }
}

public static class ApiResponse
{
    public static ApiResponse<T> Ok<T>(T data, string message = "Thành công") =>
        new() { Code = 200, Message = message, Data = data };

    public static ApiResponse<T> Created<T>(T data, string message = "Tạo thành công") =>
        new() { Code = 201, Message = message, Data = data };

    public static ApiResponse<object> Error(int code, string message) =>
        new() { Code = code, Message = message };

    public static ApiResponse<object> BadRequest(string message)   => Error(400, message);
    public static ApiResponse<object> Unauthorized(string message) => Error(401, message);
    public static ApiResponse<object> Forbidden(string message)    => Error(403, message);
    public static ApiResponse<object> NotFound(string message)     => Error(404, message);
    public static ApiResponse<object> TooManyRequests(string message) => Error(429, message);
    public static ApiResponse<object> ServerError(string message)  => Error(500, message);
}
