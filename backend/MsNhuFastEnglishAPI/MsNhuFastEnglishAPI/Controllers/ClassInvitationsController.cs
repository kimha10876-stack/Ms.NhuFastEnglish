using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public class ClassInvitationsController(ClassService classService) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── POST /api/classes/{id}/invite ─────────────────────────────────────────
    [HttpPost("{id:guid}/invite")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateInvite(Guid id, [FromBody] CreateInviteRequest req)
    {
        var link = await classService.CreateInviteAsync(id, req.ExpiryDays);
        return Ok(ApiResponse.Ok(link, "Tạo link mời thành công"));
    }

    // ── GET /api/classes/{id}/invite ──────────────────────────────────────────
    [HttpGet("{id:guid}/invite")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetActiveInvite(Guid id)
    {
        var link = await classService.GetActiveInviteAsync(id);
        return Ok(ApiResponse.Ok(link));
    }

    // ── DELETE /api/classes/{id}/invite ───────────────────────────────────────
    [HttpDelete("{id:guid}/invite")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> RevokeInvite(Guid id)
    {
        var ok = await classService.RevokeInviteAsync(id);
        if (!ok) return BadRequest(ApiResponse.BadRequest("Không tìm thấy link mời đang hoạt động"));
        return Ok(ApiResponse.Ok<object?>(null, "Hủy link mời thành công"));
    }

    // ── GET /api/classes/join/{token} — public ────────────────────────────────
    [HttpGet("join/{token}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetInviteInfo(string token)
    {
        var info = await classService.GetInviteInfoAsync(token);
        if (info is null)
            return NotFound(ApiResponse.NotFound("Link mời không hợp lệ hoặc đã hết hạn"));
        return Ok(ApiResponse.Ok(info));
    }

    // ── POST /api/classes/join/{token} — authenticated ────────────────────────
    [HttpPost("join/{token}")]
    [Authorize]
    public async Task<IActionResult> JoinByInvite(string token)
    {
        var (ok, error) = await classService.JoinByInviteAsync(token, UserId);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Tham gia lớp học thành công"));
    }
}
