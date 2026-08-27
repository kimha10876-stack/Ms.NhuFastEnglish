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
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public class ClassDocumentsController(ClassService classService, AppDbContext db) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── POST /api/classes/{id}/documents ──────────────────────────────────────
    [HttpPost("{id:guid}/documents")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateDocument(Guid id, [FromBody] CreateDocumentRequest req)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        if (req.SessionId.HasValue)
        {
            var sessionExists = await db.ClassSessions.AnyAsync(s => s.Id == req.SessionId.Value);
            if (!sessionExists) return BadRequest(ApiResponse.BadRequest("Buổi học không tồn tại"));
        }

        var classIds = req.ShareClassIds ?? new System.Collections.Generic.List<Guid>();
        if (!classIds.Contains(id))
        {
            classIds.Add(id);
        }

        var firstDocId = Guid.Empty;

        foreach (var classId in classIds)
        {
            var targetClass = await db.Classes.FindAsync(classId);
            if (targetClass == null) continue;

            var doc = new ClassDocument
            {
                Id = Guid.NewGuid(),
                ClassId = classId,
                SessionId = classId == id ? req.SessionId : null,
                Title = req.Title,
                FileUrl = req.FileUrl,
                FileType = req.FileType,
                FileSizeKb = req.FileSizeKb,
                UploadedBy = UserId,
                CreatedAt = DateTime.UtcNow
            };

            if (firstDocId == Guid.Empty)
            {
                firstDocId = doc.Id;
            }

            db.ClassDocuments.Add(doc);
        }

        await db.SaveChangesAsync();

        return StatusCode(201, ApiResponse.Created(new { Id = firstDocId }, "Thêm tài liệu thành công"));
    }

    // ── GET /api/classes/all-documents ────────────────────────────────────────
    [HttpGet("all-documents")]
    public async Task<IActionResult> GetAllDocuments([FromQuery] string? search)
    {
        var isStudent = User.IsInRole("Student");
        var isTeacher = User.IsInRole("Teacher");
        var isAdmin = User.IsInRole("Admin");

        IQueryable<ClassDocument> query = db.ClassDocuments
            .Include(d => d.Class)
            .Include(d => d.Session)
            .Include(d => d.Uploader);

        if (isStudent)
        {
            var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
            if (profile == null) return Ok(ApiResponse.Ok(new List<object>()));

            query = query.Where(d => db.ClassMembers.Any(m => m.ClassId == d.ClassId && m.StudentId == profile.Id && m.Status == "active"));
        }
        else if (isTeacher && !isAdmin)
        {
            query = query.Where(d => d.Class.TeacherId == UserId || d.UploadedBy == UserId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(d => d.Title.ToLower().Contains(searchLower));
        }

        var docs = await query
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new
            {
                Id = d.Id,
                ClassId = d.ClassId,
                ClassName = d.Class.Name,
                SessionId = d.SessionId,
                SessionTopic = d.Session != null ? d.Session.Topic : null,
                SessionNumber = d.Session != null ? (int?)d.Session.SessionNumber : null,
                Title = d.Title,
                FileUrl = d.FileUrl,
                FileType = d.FileType,
                FileSizeKb = d.FileSizeKb,
                UploadedBy = d.UploadedBy,
                UploadedByName = d.Uploader != null ? d.Uploader.FullName : "Giáo viên",
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse.Ok(docs));
    }

    // ── DELETE /api/classes/documents/{documentId} ───────────────────────────
    [HttpDelete("documents/{documentId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteDocument(Guid documentId)
    {
        var doc = await db.ClassDocuments.FindAsync(documentId);
        if (doc == null) return NotFound(ApiResponse.NotFound("Tài liệu không tồn tại"));

        db.ClassDocuments.Remove(doc);
        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Xóa tài liệu thành công"));
    }

    // ── GET /api/classes/students/search ─────────────────────────────────────
    [HttpGet("students/search")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> SearchStudents([FromQuery] string q = "")
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(ApiResponse.Ok(Array.Empty<StudentSearchDto>()));
        var results = await classService.SearchStudentsAsync(q);
        return Ok(ApiResponse.Ok(results));
    }

    // ── GET /api/classes/teachers/search ─────────────────────────────────────
    [HttpGet("teachers/search")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> SearchTeachers([FromQuery] string q = "")
    {
        var results = await classService.SearchTeachersAsync(q);
        return Ok(ApiResponse.Ok(results));
    }
}
