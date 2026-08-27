using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
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
public class ClassSessionsController(AppDbContext db) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin =>
        User.IsInRole("Admin");

    // ── GET /api/classes/{id}/sessions ─────────────────────────────────────────
    [HttpGet("{id:guid}/sessions")]
    public async Task<IActionResult> GetSessions(Guid id)
    {
        var sessions = await db.ClassSessions
            .Include(s => s.GuestTeacher)
            .Include(s => s.Documents)
                .ThenInclude(d => d.Uploader)
            .Where(s => s.ClassId == id)
            .OrderBy(s => s.SessionNumber)
            .ToListAsync();

        var generalDocuments = await db.ClassDocuments
            .Include(d => d.Uploader)
            .Where(d => d.ClassId == id && d.SessionId == null)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        // Check if current user is a Student and get their attendance dictionary
        var studentAttendances = new Dictionary<Guid, string>();
        var studentProfile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (studentProfile != null)
        {
            studentAttendances = await db.ClassAttendances
                .Where(ca => ca.ClassId == id && ca.StudentId == studentProfile.Id)
                .ToDictionaryAsync(ca => ca.SessionId, ca => ca.Status);
        }

        var sessionDtos = sessions.Select(s => new ClassSessionDto(
            Id: s.Id,
            ClassId: s.ClassId,
            SessionNumber: s.SessionNumber,
            SessionDate: s.SessionDate,
            StartTime: s.StartTime,
            EndTime: s.EndTime,
            Topic: s.Topic,
            Note: s.Note,
            GuestTeacherId: s.GuestTeacherId,
            GuestTeacherName: s.GuestTeacherId.HasValue ? s.GuestTeacher?.FullName : s.GuestTeacherName,
            Documents: s.Documents.Select(d => new ClassDocumentDto(
                Id: d.Id,
                ClassId: d.ClassId,
                SessionId: d.SessionId,
                Title: d.Title,
                FileUrl: d.FileUrl,
                FileType: d.FileType,
                FileSizeKb: d.FileSizeKb,
                UploadedBy: d.UploadedBy,
                UploadedByName: d.Uploader.FullName,
                CreatedAt: d.CreatedAt
            )).ToList(),
            AttendanceStatus: studentAttendances.TryGetValue(s.Id, out var status) ? status : null
        )).ToList();

        var generalDocDtos = generalDocuments.Select(d => new ClassDocumentDto(
            Id: d.Id,
            ClassId: d.ClassId,
            SessionId: d.SessionId,
            Title: d.Title,
            FileUrl: d.FileUrl,
            FileType: d.FileType,
            FileSizeKb: d.FileSizeKb,
            UploadedBy: d.UploadedBy,
            UploadedByName: d.Uploader.FullName,
            CreatedAt: d.CreatedAt
        )).ToList();

        return Ok(ApiResponse.Ok(new {
            Sessions = sessionDtos,
            GeneralDocuments = generalDocDtos
        }));
    }

    // ── POST /api/classes/{id}/sessions ────────────────────────────────────────
    [HttpPost("{id:guid}/sessions")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateSession(Guid id, [FromBody] CreateSessionRequest req)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var session = new ClassSession
        {
            Id = Guid.NewGuid(),
            ClassId = id,
            SessionNumber = req.SessionNumber,
            SessionDate = req.SessionDate,
            StartTime = req.StartTime,
            EndTime = req.EndTime,
            Topic = req.Topic,
            Note = req.Note,
            GuestTeacherId = req.GuestTeacherId,
            GuestTeacherName = req.GuestTeacherName,
            CreatedAt = DateTime.UtcNow
        };

        db.ClassSessions.Add(session);
        await db.SaveChangesAsync();

        return StatusCode(201, ApiResponse.Created(new { session.Id }, "Tạo buổi học thành công"));
    }

    // ── POST /api/classes/{id}/import-curriculum ──────────────────────────────
    [HttpPost("{id:guid}/import-curriculum")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> ImportCurriculum(Guid id, [FromBody] ImportCurriculumRequest req)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var template = await db.CurriculumTemplates
            .Include(t => t.Units)
            .FirstOrDefaultAsync(t => t.Id == req.TemplateId);
        if (template == null) return NotFound(ApiResponse.NotFound("Khung chương trình mẫu không tồn tại"));

        if (!template.Units.Any())
            return BadRequest(ApiResponse.BadRequest("Khung chương trình mẫu này không có Unit nào"));

        // 1. Parse class schedule time (ScheduleTime is e.g. "18:00-19:30")
        var startTime = "18:00";
        var endTime = "20:00";
        if (!string.IsNullOrWhiteSpace(cls.ScheduleTime) && cls.ScheduleTime.Contains('-'))
        {
            var parts = cls.ScheduleTime.Split('-');
            if (parts.Length == 2)
            {
                startTime = parts[0].Trim();
                endTime = parts[1].Trim();
            }
        }

        // 2. Map weekdays integers (1=Monday, 2=Tuesday ... 7=Sunday) to C# DayOfWeek
        var scheduledDays = new List<DayOfWeek>();
        foreach (var w in req.Weekdays)
        {
            if (w == 7) scheduledDays.Add(DayOfWeek.Sunday);
            else if (w >= 1 && w <= 6) scheduledDays.Add((DayOfWeek)w);
        }

        if (!scheduledDays.Any())
            return BadRequest(ApiResponse.BadRequest("Lịch học trong tuần không hợp lệ"));

        // 3. Get currently existing session count
        var currentMaxNumber = await db.ClassSessions
            .Where(s => s.ClassId == id)
            .Select(s => (int?)s.SessionNumber)
            .MaxAsync() ?? 0;

        var currentDate = req.StartDate;
        var isFirst = true;

        var unitsSorted = template.Units.OrderBy(u => u.SessionNumber).ToList();

        foreach (var u in unitsSorted)
        {
            currentDate = GetNextSessionDate(currentDate, scheduledDays, isFirst);
            isFirst = false;

            var session = new ClassSession
            {
                Id = Guid.NewGuid(),
                ClassId = id,
                SessionNumber = ++currentMaxNumber,
                SessionDate = currentDate,
                StartTime = startTime,
                EndTime = endTime,
                Topic = u.Topic,
                Note = u.Note,
                CreatedAt = DateTime.UtcNow
            };
            db.ClassSessions.Add(session);

            if (!string.IsNullOrEmpty(u.DocumentsJson))
            {
                try
                {
                    var docs = JsonSerializer.Deserialize<List<TemplateDocumentDto>>(u.DocumentsJson);
                    if (docs != null)
                    {
                        foreach (var docDto in docs)
                        {
                            var doc = new ClassDocument
                            {
                                Id = Guid.NewGuid(),
                                ClassId = id,
                                SessionId = session.Id,
                                Title = docDto.Title,
                                FileUrl = docDto.FileUrl,
                                FileType = docDto.FileType,
                                FileSizeKb = docDto.FileSizeKb,
                                UploadedBy = cls.TeacherId,
                                CreatedAt = DateTime.UtcNow
                            };
                            db.ClassDocuments.Add(doc);
                        }
                    }
                }
                catch { }
            }
        }

        // 4. Import general template documents if any
        if (!string.IsNullOrEmpty(template.DocumentsJson))
        {
            try
            {
                var generalDocs = JsonSerializer.Deserialize<List<TemplateDocumentDto>>(template.DocumentsJson);
                if (generalDocs != null)
                {
                    foreach (var docDto in generalDocs)
                    {
                        var doc = new ClassDocument
                        {
                            Id = Guid.NewGuid(),
                            ClassId = id,
                            SessionId = null,
                            Title = docDto.Title,
                            FileUrl = docDto.FileUrl,
                            FileType = docDto.FileType,
                            FileSizeKb = docDto.FileSizeKb,
                            UploadedBy = cls.TeacherId,
                            CreatedAt = DateTime.UtcNow
                        };
                        db.ClassDocuments.Add(doc);
                    }
                }
            }
            catch { }
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok(new { Count = unitsSorted.Count }, "Nhập khung chương trình thành công"));
    }

    private static DateOnly GetNextSessionDate(DateOnly currentDate, List<DayOfWeek> scheduledDays, bool includeCurrent)
    {
        if (scheduledDays == null || !scheduledDays.Any())
            return currentDate.AddDays(1);

        var date = currentDate;
        if (!includeCurrent)
        {
            date = date.AddDays(1);
        }

        for (int i = 0; i < 30; i++)
        {
            if (scheduledDays.Contains(date.DayOfWeek))
            {
                return date;
            }
            date = date.AddDays(1);
        }

        return currentDate;
    }

    // ── PUT /api/classes/sessions/{sessionId} ──────────────────────────────────
    [HttpPut("sessions/{sessionId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdateSession(Guid sessionId, [FromBody] UpdateSessionRequest req)
    {
        var session = await db.ClassSessions.FindAsync(sessionId);
        if (session == null) return NotFound(ApiResponse.NotFound("Buổi học không tồn tại"));

        if (req.SessionNumber.HasValue) session.SessionNumber = req.SessionNumber.Value;
        if (req.SessionDate.HasValue) session.SessionDate = req.SessionDate.Value;
        if (req.StartTime != null) session.StartTime = req.StartTime;
        if (req.EndTime != null) session.EndTime = req.EndTime;
        if (req.Topic != null) session.Topic = req.Topic;
        if (req.Note != null) session.Note = req.Note;
        session.GuestTeacherId = req.GuestTeacherId;
        session.GuestTeacherName = req.GuestTeacherName;

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật buổi học thành công"));
    }

    // ── DELETE /api/classes/sessions/{sessionId} ───────────────────────────────
    [HttpDelete("sessions/{sessionId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteSession(Guid sessionId)
    {
        var session = await db.ClassSessions.FindAsync(sessionId);
        if (session == null) return NotFound(ApiResponse.NotFound("Buổi học không tồn tại"));

        db.ClassSessions.Remove(session);
        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Xóa buổi học thành công"));
    }

    // ── GET /api/classes/{id}/attendance/{sessionId} ───────────────────────────
    [HttpGet("{id:guid}/attendance/{sessionId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetAttendance(Guid id, Guid sessionId)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var session = await db.ClassSessions.FindAsync(sessionId);
        if (session == null) return NotFound(ApiResponse.NotFound("Buổi học không tồn tại"));

        var members = await db.ClassMembers
            .Where(m => m.ClassId == id && m.Status == "active")
            .Include(m => m.Student)
            .ThenInclude(s => s.User)
            .OrderBy(m => m.Student.User.FullName)
            .ToListAsync();

        var attendances = await db.ClassAttendances
            .Where(a => a.ClassId == id && a.SessionId == sessionId)
            .ToDictionaryAsync(a => a.StudentId, a => a.Status);

        var result = members.Select(m => new StudentAttendanceDto(
            m.StudentId,
            m.Student.User.FullName,
            m.Student.User.Email,
            attendances.TryGetValue(m.StudentId, out var status) ? status : null
        )).ToList();

        return Ok(ApiResponse.Ok(result, "Lấy danh sách điểm danh thành công"));
    }

    // ── POST /api/classes/{id}/attendance/{sessionId} ──────────────────────────
    [HttpPost("{id:guid}/attendance/{sessionId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdateAttendance(Guid id, Guid sessionId, [FromBody] UpdateAttendanceRequest req)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var session = await db.ClassSessions.FindAsync(sessionId);
        if (session == null) return NotFound(ApiResponse.NotFound("Buổi học không tồn tại"));

        var memberExists = await db.ClassMembers.AnyAsync(m => m.ClassId == id && m.StudentId == req.StudentId && m.Status == "active");
        if (!memberExists) return BadRequest(ApiResponse.BadRequest("Học viên không thuộc lớp này hoặc đã rời lớp"));

        var status = req.Status.ToLower().Trim();
        if (status != "present" && status != "absent")
            return BadRequest(ApiResponse.BadRequest("Trạng thái điểm danh không hợp lệ. Chỉ chấp nhận 'present' hoặc 'absent'"));

        var record = await db.ClassAttendances
            .FirstOrDefaultAsync(a => a.ClassId == id && a.SessionId == sessionId && a.StudentId == req.StudentId);

        if (record == null)
        {
            record = new ClassAttendance
            {
                Id = Guid.NewGuid(),
                ClassId = id,
                SessionId = sessionId,
                StudentId = req.StudentId,
                Status = status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.ClassAttendances.Add(record);
        }
        else
        {
            record.Status = status;
            record.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok(new { record.Id, record.Status }, "Cập nhật điểm danh thành công"));
    }
}
