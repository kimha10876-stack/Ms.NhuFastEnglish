using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public class ClassAnnouncementsController(AppDbContext db) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin =>
        User.IsInRole("Admin");

    // ── GET /api/classes/{id}/announcements ─────────────────────────────────
    [HttpGet("{id:guid}/announcements")]
    public async Task<IActionResult> GetAnnouncements(Guid id)
    {
        var classExists = await db.Classes.AnyAsync(c => c.Id == id);
        if (!classExists) return NotFound(ApiResponse.NotFound("Không tìm thấy lớp học"));

        var announcements = await db.ClassAnnouncements
            .Include(a => a.Creator)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .Include(a => a.Comments)
                .ThenInclude(c => c.Creator)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
            .Where(a => a.ClassId == id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var result = announcements.Select(a => new ClassAnnouncementDto(
            Id: a.Id,
            ClassId: a.ClassId,
            Content: a.Content,
            CreatedBy: a.CreatedBy,
            CreatorName: a.Creator.FullName,
            CreatorRole: a.Creator.UserRoles.FirstOrDefault()?.Role.Name ?? "User",
            CreatedAt: a.CreatedAt,
            Comments: a.Comments.OrderBy(c => c.CreatedAt).Select(c => new AnnouncementCommentDto(
                Id: c.Id,
                AnnouncementId: c.AnnouncementId,
                Content: c.Content,
                CreatedBy: c.CreatedBy,
                CreatorName: c.Creator.FullName,
                CreatorRole: c.Creator.UserRoles.FirstOrDefault()?.Role.Name ?? "User",
                CreatedAt: c.CreatedAt,
                ParentCommentId: c.ParentCommentId
            )).ToList()
        )).ToList();

        return Ok(ApiResponse.Ok(result));
    }

    // ── POST /api/classes/{id}/announcements ────────────────────────────────
    [HttpPost("{id:guid}/announcements")]
    public async Task<IActionResult> CreateAnnouncement(Guid id, [FromBody] CreateAnnouncementRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(ApiResponse.BadRequest("Nội dung thông báo không được để trống"));

        var classExists = await db.Classes.AnyAsync(c => c.Id == id);
        if (!classExists) return NotFound(ApiResponse.NotFound("Không tìm thấy lớp học"));

        var isTeacherOfClass = await db.Classes.AnyAsync(c => c.Id == id && c.TeacherId == UserId);
        if (!IsAdmin && !isTeacherOfClass)
            return StatusCode(403, ApiResponse.Forbidden("Chỉ giáo viên phụ trách hoặc Admin mới có quyền đăng thông báo"));

        var announcement = new ClassAnnouncement
        {
            Id = Guid.NewGuid(),
            ClassId = id,
            Content = req.Content,
            CreatedBy = UserId,
            CreatedAt = DateTime.UtcNow
        };

        db.ClassAnnouncements.Add(announcement);
        await db.SaveChangesAsync();

        var createdAnn = await db.ClassAnnouncements
            .Include(a => a.Creator)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(a => a.Id == announcement.Id);

        var dto = new ClassAnnouncementDto(
            Id: createdAnn!.Id,
            ClassId: createdAnn.ClassId,
            Content: createdAnn.Content,
            CreatedBy: createdAnn.CreatedBy,
            CreatorName: createdAnn.Creator.FullName,
            CreatorRole: createdAnn.Creator.UserRoles.FirstOrDefault()?.Role.Name ?? "User",
            CreatedAt: createdAnn.CreatedAt,
            Comments: new List<AnnouncementCommentDto>()
        );

        return Ok(ApiResponse.Ok(dto, "Đăng thông báo thành công"));
    }

    // ── PUT /api/classes/{id}/announcements/{announcementId} ─────────────────
    [HttpPut("{id:guid}/announcements/{announcementId:guid}")]
    public async Task<IActionResult> UpdateAnnouncement(Guid id, Guid announcementId, [FromBody] CreateAnnouncementRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(ApiResponse.BadRequest("Nội dung thông báo không được để trống"));

        var ann = await db.ClassAnnouncements.FirstOrDefaultAsync(a => a.Id == announcementId && a.ClassId == id);
        if (ann == null) return NotFound(ApiResponse.NotFound("Không tìm thấy thông báo"));

        if (!IsAdmin && ann.CreatedBy != UserId)
            return StatusCode(403, ApiResponse.Forbidden("Bạn không có quyền chỉnh sửa thông báo này"));

        ann.Content = req.Content;
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật thông báo thành công"));
    }

    // ── DELETE /api/classes/{id}/announcements/{announcementId} ──────────────
    [HttpDelete("{id:guid}/announcements/{announcementId:guid}")]
    public async Task<IActionResult> DeleteAnnouncement(Guid id, Guid announcementId)
    {
        var ann = await db.ClassAnnouncements.FirstOrDefaultAsync(a => a.Id == announcementId && a.ClassId == id);
        if (ann == null) return NotFound(ApiResponse.NotFound("Không tìm thấy thông báo"));

        var isTeacherOfClass = await db.Classes.AnyAsync(c => c.Id == id && c.TeacherId == UserId);
        if (!IsAdmin && !isTeacherOfClass && ann.CreatedBy != UserId)
            return StatusCode(403, ApiResponse.Forbidden("Bạn không có quyền xóa thông báo này"));

        db.ClassAnnouncements.Remove(ann);
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Xóa thông báo thành công"));
    }

    // ── POST /api/classes/{id}/announcements/{announcementId}/comments ───────
    [HttpPost("{id:guid}/announcements/{announcementId:guid}/comments")]
    public async Task<IActionResult> CreateComment(Guid id, Guid announcementId, [FromBody] CreateCommentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(ApiResponse.BadRequest("Nội dung bình luận không được để trống"));

        var annExists = await db.ClassAnnouncements.AnyAsync(a => a.Id == announcementId && a.ClassId == id);
        if (!annExists) return NotFound(ApiResponse.NotFound("Không tìm thấy thông báo"));

        var isMember = await db.ClassMembers.AnyAsync(m => m.ClassId == id && m.Student.UserId == UserId && m.Status == "active");
        var isTeacher = await db.Classes.AnyAsync(c => c.Id == id && c.TeacherId == UserId);
        if (!IsAdmin && !isTeacher && !isMember)
            return StatusCode(403, ApiResponse.Forbidden("Chỉ thành viên của lớp mới được quyền bình luận"));

        var comment = new AnnouncementComment
        {
            Id = Guid.NewGuid(),
            AnnouncementId = announcementId,
            Content = req.Content,
            CreatedBy = UserId,
            CreatedAt = DateTime.UtcNow,
            ParentCommentId = req.ParentCommentId
        };

        db.AnnouncementComments.Add(comment);
        await db.SaveChangesAsync();

        var createdComment = await db.AnnouncementComments
            .Include(c => c.Creator)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(c => c.Id == comment.Id);

        var dto = new AnnouncementCommentDto(
            Id: createdComment!.Id,
            AnnouncementId: createdComment.AnnouncementId,
            Content: createdComment.Content,
            CreatedBy: createdComment.CreatedBy,
            CreatorName: createdComment.Creator.FullName,
            CreatorRole: createdComment.Creator.UserRoles.FirstOrDefault()?.Role.Name ?? "User",
            CreatedAt: createdComment.CreatedAt,
            ParentCommentId: createdComment.ParentCommentId
        );

        return Ok(ApiResponse.Ok(dto, "Bình luận thành công"));
    }

    // ── DELETE /api/classes/{id}/announcements/{announcementId}/comments/{commentId} ─
    [HttpDelete("{id:guid}/announcements/{announcementId:guid}/comments/{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid id, Guid announcementId, Guid commentId)
    {
        var comment = await db.AnnouncementComments
            .Include(c => c.Announcement)
            .FirstOrDefaultAsync(c => c.Id == commentId && c.AnnouncementId == announcementId && c.Announcement.ClassId == id);
        if (comment == null) return NotFound(ApiResponse.NotFound("Không tìm thấy bình luận"));

        var isTeacherOfClass = await db.Classes.AnyAsync(c => c.Id == id && c.TeacherId == UserId);
        if (!IsAdmin && !isTeacherOfClass && comment.CreatedBy != UserId)
            return StatusCode(403, ApiResponse.Forbidden("Bạn không có quyền xóa bình luận này"));

        db.AnnouncementComments.Remove(comment);
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Xóa bình luận thành công"));
    }
}
