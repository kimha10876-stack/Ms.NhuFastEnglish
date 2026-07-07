using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/teachers")]
[Authorize(Roles = "Admin")]
public class TeachersController(TeacherService teacherService) : ControllerBase
{
    // ── GET /api/teachers ─────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetTeachers(
        [FromQuery] string search = "",
        [FromQuery] string type = "",
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await teacherService.GetTeachersAsync(search, type, isActive, page, pageSize);
        return Ok(ApiResponse.Ok(result));
    }

    // ── GET /api/teachers/{id} ────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTeacherDetail(Guid id)
    {
        var result = await teacherService.GetTeacherDetailAsync(id);
        if (result is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy giáo viên"));
        return Ok(ApiResponse.Ok(result));
    }

    // ── POST /api/teachers ────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherRequest req)
    {
        var (result, error) = await teacherService.CreateTeacherAsync(req);
        if (error is not null)
            return BadRequest(ApiResponse.BadRequest(error));
        return StatusCode(201, ApiResponse.Created(result!, "Tạo tài khoản giáo viên thành công"));
    }

    // ── PUT /api/teachers/{id} ────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTeacher(Guid id, [FromBody] UpdateTeacherRequest req)
    {
        var (ok, error) = await teacherService.UpdateTeacherAsync(id, req);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật thông tin giáo viên thành công"));
    }

    // ── DELETE /api/teachers/{id} ─────────────────────────────────────────────
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTeacher(Guid id)
    {
        var ok = await teacherService.DeleteTeacherAsync(id);
        if (!ok) return NotFound(ApiResponse.NotFound("Không tìm thấy giáo viên"));
        return Ok(ApiResponse.Ok<object?>(null, "Khóa tài khoản giáo viên thành công"));
    }
}
