using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace MsNhuFastEnglishAPI.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await authService.LoginAsync(req);
        if (result is null)
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        var result = await authService.RefreshAsync(req.RefreshToken);
        if (result is null)
            return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });
        return Ok(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await authService.LogoutAsync(userId, req.RefreshToken, req.AllDevices);
        return NoContent();
    }

    [HttpPost("register/student")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudentRequest req)
    {
        var (result, error) = await authService.RegisterStudentAsync(req);
        if (error is not null)
            return BadRequest(new { message = error });
        return StatusCode(201, result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (result, error) = await authService.RegisterAsync(req);
        if (error is not null)
            return BadRequest(new { message = error });
        return StatusCode(201, result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        await authService.ForgotPasswordAsync(req.Email);
        return Ok(new { message = "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var ok = await authService.ResetPasswordAsync(req);
        if (!ok) return BadRequest(new { message = "Token không hợp lệ hoặc đã hết hạn" });
        return Ok(new { message = "Đổi mật khẩu thành công" });
    }
}
