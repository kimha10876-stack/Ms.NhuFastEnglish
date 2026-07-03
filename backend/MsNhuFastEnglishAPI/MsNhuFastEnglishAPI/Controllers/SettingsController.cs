using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController(SettingsService settingsService) : ControllerBase
{
    // ── GET /api/settings (Public) ────────────────────────────────────────────
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetSettings()
    {
        var result = await settingsService.GetSettingsAsync();
        return Ok(ApiResponse.Ok(result));
    }

    // ── PUT /api/settings (Admin) ─────────────────────────────────────────────
    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SaveSettings([FromBody] SaveSettingsRequest req)
    {
        var ok = await settingsService.SaveSettingsAsync(req);
        if (!ok) return BadRequest(ApiResponse.BadRequest("Lưu cấu hình thất bại"));
        return Ok(ApiResponse.Ok<object?>(null, "Lưu cấu hình hệ thống thành công"));
    }

    // ── GET /api/settings/users (Admin) ───────────────────────────────────────
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await settingsService.GetUsersAsync();
        return Ok(ApiResponse.Ok(result));
    }

    // ── PUT /api/settings/users/{userId}/roles (Admin) ────────────────────────
    [HttpPut("users/{userId:guid}/roles")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserRoles(Guid userId, [FromBody] UpdateUserRolesRequest req)
    {
        var ok = await settingsService.UpdateUserRolesAsync(userId, req);
        if (!ok) return NotFound(ApiResponse.NotFound("Không tìm thấy người dùng"));
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật quyền thành viên thành công"));
    }

    // ── POST /api/settings/categories (Admin) ──────────────────────────────────
    [HttpPost("categories")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest req)
    {
        var (result, error) = await settingsService.CreateCategoryAsync(req);
        if (error is not null)
            return BadRequest(ApiResponse.BadRequest(error));
        return StatusCode(201, ApiResponse.Created(result!, "Tạo danh mục mới thành công"));
    }

    // ── PUT /api/settings/categories/{id} (Admin) ─────────────────────────────
    [HttpPut("categories/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest req)
    {
        var (ok, error) = await settingsService.UpdateCategoryAsync(id, req);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật danh mục thành công"));
    }

    // ── DELETE /api/settings/categories/{id} (Admin) ──────────────────────────
    [HttpDelete("categories/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var (ok, error) = await settingsService.DeleteCategoryAsync(id);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, error ?? "Xoá danh mục thành công"));
    }
}
