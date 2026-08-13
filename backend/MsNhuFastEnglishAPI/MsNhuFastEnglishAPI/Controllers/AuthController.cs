using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (result, error) = await authService.LoginAsync(req);
        if (error is not null)
        {
            if (error == "Tài khoản của bạn đã bị khóa")
                return StatusCode(403, ApiResponse.Forbidden(error));
            return Unauthorized(ApiResponse.Unauthorized(error));
        }
        return Ok(ApiResponse.Ok(result!, "Đăng nhập thành công"));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        var result = await authService.RefreshAsync(req.RefreshToken);
        if (result is null)
            return Unauthorized(ApiResponse.Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn"));
        return Ok(ApiResponse.Ok(result, "Làm mới token thành công"));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await authService.LogoutAsync(userId, req.RefreshToken, req.AllDevices);
        return Ok(ApiResponse.Ok<object?>(null, "Đăng xuất thành công"));
    }

    [HttpPost("register/student")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudentRequest req)
    {
        var (result, error) = await authService.RegisterStudentAsync(req);
        if (error is not null)
            return BadRequest(ApiResponse.BadRequest(error));
        return StatusCode(201, ApiResponse.Created(result!, "Đăng ký thành công"));
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (result, error) = await authService.RegisterAsync(req);
        if (error is not null)
            return BadRequest(ApiResponse.BadRequest(error));
        return StatusCode(201, ApiResponse.Created(result!, "Tạo tài khoản thành công"));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var (ok, isCooldown, error) = await authService.ForgotPasswordAsync(req.Email);
        if (!ok && isCooldown) return StatusCode(429, ApiResponse.TooManyRequests(error!));
        if (!ok)               return NotFound(ApiResponse.NotFound(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Mã OTP đã được gửi đến email của bạn"));
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        var (ok, error) = await authService.VerifyOtpAsync(req);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Mã OTP hợp lệ"));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var (ok, error) = await authService.ResetPasswordAsync(req);
        if (!ok)
            return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Đổi mật khẩu thành công"));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (ok, error) = await authService.ChangePasswordAsync(userId, req);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Thay đổi mật khẩu thành công"));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (result, error) = await authService.UpdateProfileAsync(userId, req);
        if (error is not null) return BadRequest(ApiResponse.BadRequest(error));
        return Ok(ApiResponse.Ok(result, "Cập nhật thông tin cá nhân thành công"));
    }
}
