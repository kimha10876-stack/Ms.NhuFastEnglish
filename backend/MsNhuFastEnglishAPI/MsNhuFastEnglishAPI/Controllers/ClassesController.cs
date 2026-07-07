using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public class ClassesController(ClassService classService, AppDbContext db) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin =>
        User.IsInRole("Admin");

    // ── GET /api/classes/my-classes ───────────────────────────────────────────
    [HttpGet("my-classes")]
    public async Task<IActionResult> GetMyClasses()
    {
        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy hồ sơ học viên"));

        var classMembers = await db.ClassMembers
            .Include(m => m.Class)
                .ThenInclude(c => c.Category)
            .Include(m => m.Class)
                .ThenInclude(c => c.Teacher)
            .Where(m => m.StudentId == profile.Id && m.Status == "active")
            .ToListAsync();

        var classes = classMembers.Select(m => new {
            ClassId = m.ClassId,
            ClassName = m.Class.Name,
            CategoryName = m.Class.Category.Name,
            CategoryColorHex = m.Class.Category.ColorHex,
            TeacherName = m.Class.Teacher.FullName,
            Status = m.Class.Status,
            JoinedAt = m.JoinedAt,
            ScheduleDays = m.Class.ScheduleDays,
            ScheduleTime = m.Class.ScheduleTime,
            Room = m.Class.Room
        }).ToList();

        return Ok(ApiResponse.Ok(classes));
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

    // ── GET /api/classes/students/search?q= ──────────────────────────────────

    [HttpGet("students/search")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> SearchStudents([FromQuery] string q = "")
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(ApiResponse.Ok(Array.Empty<StudentSearchDto>()));
        var results = await classService.SearchStudentsAsync(q);
        return Ok(ApiResponse.Ok(results));
    }

    // ── GET /api/classes/teachers/search?q= ──────────────────────────────────

    [HttpGet("teachers/search")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> SearchTeachers([FromQuery] string q = "")
    {
        var results = await classService.SearchTeachersAsync(q);
        return Ok(ApiResponse.Ok(results));
    }

    // ── POST /api/classes/{id}/invite ─────────────────────────────────────────

    [HttpPost("{id:guid}/invite")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateInvite(Guid id, [FromBody] CreateInviteRequest req)
    {
        var link = await classService.CreateInviteAsync(id, req.ExpiryDays);
        return Ok(ApiResponse.Ok(link, "Tạo link mời thành công"));
    }

    [HttpGet("{id:guid}/invite")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetActiveInvite(Guid id)
    {
        var link = await classService.GetActiveInviteAsync(id);
        return Ok(ApiResponse.Ok(link));
    }

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
