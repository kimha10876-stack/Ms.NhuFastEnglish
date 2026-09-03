using System;
using System.Collections.Generic;
using System.Linq;
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
public class ClassesController(ClassService classService) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin =>
        User.IsInRole("Admin");

    // ── GET /api/classes/my-classes ───────────────────────────────────────────
    [HttpGet("my-classes")]
    public async Task<IActionResult> GetMyClasses()
    {
        var result = await classService.GetMyClassesAsync(UserId);
        return Ok(ApiResponse.Ok(result));
    }

    // ── GET /api/classes ──────────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string search = "",
        [FromQuery] int? categoryId = null,
        [FromQuery] string status = "",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var teacherFilter = IsAdmin ? (Guid?)null : UserId;
        var result = await classService.GetAllAsync(
            teacherFilter, search, categoryId, status, page, pageSize);
        return Ok(ApiResponse.Ok(result));
    }

    // ── POST /api/classes ─────────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateClassRequest req)
    {
        var (result, error) = await classService.CreateAsync(req);
        if (error is not null)
            return BadRequest(ApiResponse.BadRequest(error));
        return StatusCode(201, ApiResponse.Created(result!, "Tạo lớp học thành công"));
    }

    // ── GET /api/classes/{id} ─────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var result = await classService.GetDetailAsync(id);
        if (result is null)
            return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));
        return Ok(ApiResponse.Ok(result));
    }

    // ── PUT /api/classes/{id} ─────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClassRequest req)
    {
        var (ok, error) = await classService.UpdateAsync(id, req);
        if (!ok) return NotFound(ApiResponse.NotFound(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật thành công"));
    }

    // ── DELETE /api/classes/{id} ──────────────────────────────────────────────
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await classService.DeleteAsync(id);
        if (!ok) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));
        return Ok(ApiResponse.Ok<object?>(null, "Xoá lớp học thành công"));
    }

    // ── GET /api/classes/{id}/members ─────────────────────────────────────────
    [HttpGet("{id:guid}/members")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        var detail = await classService.GetDetailAsync(id);
        if (detail is null)
            return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));
        return Ok(ApiResponse.Ok(detail.Members));
    }

    // ── POST /api/classes/{id}/members ────────────────────────────────────────
    [HttpPost("{id:guid}/members")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddMemberRequest req)
    {
        var (ok, error) = await classService.AddMemberAsync(id, req.StudentId);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Thêm học sinh thành công"));
    }

    // ── DELETE /api/classes/{id}/members/{memberId} ───────────────────────────
    [HttpDelete("{id:guid}/members/{memberId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid memberId)
    {
        var ok = await classService.RemoveMemberAsync(id, memberId);
        if (!ok) return NotFound(ApiResponse.NotFound("Không tìm thấy thành viên"));
        return Ok(ApiResponse.Ok<object?>(null, "Đã xoá học sinh khỏi lớp"));
    }

    // ── GET /api/classes/categories ───────────────────────────────────────────
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var results = await classService.GetCategoriesAsync();
        return Ok(ApiResponse.Ok(results));
    }
}
