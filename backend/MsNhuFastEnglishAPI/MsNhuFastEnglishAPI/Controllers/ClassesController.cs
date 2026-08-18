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
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Models.Entities;
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
        {
            profile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = UserId,
                Level = "Mới bắt đầu",
                Goal = "Giao tiếp cơ bản",
                Status = "active"
            };
            db.StudentProfiles.Add(profile);
            await db.SaveChangesAsync();
        }

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

    // ── GET /api/classes/my-assignments ───────────────────────────────────────
    [HttpGet("my-assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null)
        {
            profile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = UserId,
                Level = "Mới bắt đầu",
                Goal = "Giao tiếp cơ bản",
                Status = "active"
            };
            db.StudentProfiles.Add(profile);
            await db.SaveChangesAsync();
        }

        var assignments = await db.ClassAssignments
            .Include(a => a.Class)
                .ThenInclude(c => c.Category)
            .Include(a => a.Class)
                .ThenInclude(c => c.Teacher)
            .Include(a => a.Submissions)
            .Where(a => a.Class.ClassMembers.Any(m => m.StudentId == profile.Id && m.Status.ToLower() == "active") && (a.Class.Status == null || a.Class.Status.ToLower() == "active"))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;

        var dtos = assignments.Select(a => {
            var mySub = a.Submissions.FirstOrDefault(s => s.StudentId == profile.Id);
            var isSubmitted = mySub != null;
            var isOverdue = !isSubmitted && a.DueDate.HasValue && a.DueDate.Value < now;

            return new StudentAssignmentItemDto(
                AssignmentId:        a.Id,
                ClassId:             a.ClassId,
                ClassName:           a.Class.Name,
                CategoryName:        a.Class.Category.Name,
                CategoryColorHex:    a.Class.Category.ColorHex,
                TeacherName:         a.Class.Teacher.FullName,
                Title:               a.Title,
                Description:         a.Description,
                DueDate:             a.DueDate,
                CreatedAt:           a.CreatedAt,
                AssignmentType:      a.AssignmentType,
                AllowLateSubmission: a.AllowLateSubmission,
                IsSubmitted:         isSubmitted,
                SubmittedAt:         mySub?.SubmittedAt,
                Grade:               mySub?.Grade,
                TeacherFeedback:     mySub?.TeacherFeedback,
                IsOverdue:           isOverdue
            );
        }).OrderBy(a => a.IsSubmitted)
          .ThenBy(a => a.DueDate ?? DateTime.MaxValue)
          .ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    // ── GET /api/classes/my-tuitions ──────────────────────────────────────────
    [HttpGet("my-tuitions")]
    public async Task<IActionResult> GetMyTuitions()
    {
        var profile = await db.StudentProfiles
            .Include(sp => sp.User)
            .FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null)
        {
            profile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = UserId,
                Level = "Mới bắt đầu",
                Goal = "Giao tiếp cơ bản",
                Status = "active"
            };
            db.StudentProfiles.Add(profile);
            await db.SaveChangesAsync();
        }

        var classMembers = await db.ClassMembers
            .Include(m => m.Class)
                .ThenInclude(c => c.Category)
            .Include(m => m.Class)
                .ThenInclude(c => c.TuitionPayments)
            .Where(m => m.StudentId == profile.Id && m.Status.ToLower() == "active")
            .ToListAsync();

        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        var results = classMembers.Select(m => {
            var payments = m.Class.TuitionPayments
                .Where(tp => tp.StudentId == profile.Id)
                .OrderByDescending(tp => tp.Year)
                .ThenByDescending(tp => tp.Month)
                .ThenByDescending(tp => tp.PaidAt)
                .Select(tp => new TuitionPaymentDto(
                    Id:              tp.Id,
                    ClassId:         tp.ClassId,
                    ClassName:       m.Class.Name,
                    StudentId:       tp.StudentId,
                    StudentName:     profile.User.FullName,
                    StudentEmail:    profile.User.Email,
                    Month:           tp.Month,
                    Year:            tp.Year,
                    Amount:          tp.Amount,
                    Status:          tp.Status,
                    PaymentMethod:   tp.PaymentMethod,
                    TransactionCode: tp.TransactionCode,
                    PaidAt:          tp.PaidAt,
                    ConfirmedBy:     tp.ConfirmedBy,
                    ConfirmedAt:     tp.ConfirmedAt,
                    Note:            tp.Note
                )).ToList();

            var currentMonthPayment = payments.FirstOrDefault(p => p.Month == currentMonth && p.Year == currentYear);
            var isPaid = currentMonthPayment?.Status == "paid";
            var status = currentMonthPayment?.Status ?? "unpaid";

            return new StudentMonthlyTuitionSummaryDto(
                ClassId:                    m.ClassId,
                ClassName:                  m.Class.Name,
                CategoryName:               m.Class.Category.Name,
                CategoryColorHex:           m.Class.Category.ColorHex,
                MonthlyFee:                 m.Class.MonthlyFee,
                CurrentMonth:               currentMonth,
                CurrentYear:                currentYear,
                IsCurrentMonthPaid:         isPaid,
                CurrentMonthPaidAt:         currentMonthPayment?.PaidAt,
                CurrentMonthPaymentStatus:  status,
                History:                    payments
            );
        }).ToList();

        return Ok(ApiResponse.Ok(results));
    }

    // ── POST /api/classes/{id}/tuition/pay ────────────────────────────────────
    [HttpPost("{id:guid}/tuition/pay")]
    public async Task<IActionResult> PayTuition(Guid id, [FromBody] PayTuitionRequest req)
    {
        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy hồ sơ học viên"));

        var member = await db.ClassMembers
            .Include(m => m.Class)
            .FirstOrDefaultAsync(m => m.ClassId == id && m.StudentId == profile.Id && m.Status == "active");

        if (member == null)
            return BadRequest(ApiResponse.BadRequest("Bạn không phải thành viên của lớp học này"));

        var existingPayment = await db.TuitionPayments
            .FirstOrDefaultAsync(tp => tp.ClassId == id && tp.StudentId == profile.Id && tp.Month == req.Month && tp.Year == req.Year);

        if (existingPayment != null)
        {
            existingPayment.Amount = req.Amount;
            existingPayment.PaymentMethod = req.PaymentMethod;
            existingPayment.TransactionCode = req.TransactionCode ?? existingPayment.TransactionCode;
            existingPayment.PaidAt = DateTime.UtcNow;
            existingPayment.Status = "paid";
            existingPayment.Note = req.Note ?? existingPayment.Note;
        }
        else
        {
            var payment = new TuitionPayment
            {
                Id              = Guid.NewGuid(),
                ClassId         = id,
                StudentId       = profile.Id,
                Month           = req.Month,
                Year            = req.Year,
                Amount          = req.Amount,
                Status          = "paid",
                PaymentMethod   = req.PaymentMethod,
                TransactionCode = req.TransactionCode ?? $"MSNHU-{DateTime.UtcNow:yyyyMMddHHmmss}",
                PaidAt          = DateTime.UtcNow,
                Note            = req.Note
            };
            db.TuitionPayments.Add(payment);
        }

        // Cập nhật trạng thái học phí của member nếu là tháng hiện tại
        if (req.Month == DateTime.UtcNow.Month && req.Year == DateTime.UtcNow.Year)
        {
            member.TuitionStatus = "paid";
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Thanh toán học phí thành công"));
    }

    // ── GET /api/classes/{id}/tuition-records ─────────────────────────────────
    [HttpGet("{id:guid}/tuition-records")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetClassTuitionRecords(Guid id)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null)
            return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var payments = await db.TuitionPayments
            .Include(tp => tp.Student)
                .ThenInclude(s => s.User)
            .Where(tp => tp.ClassId == id)
            .OrderByDescending(tp => tp.Year)
            .ThenByDescending(tp => tp.Month)
            .ThenByDescending(tp => tp.PaidAt)
            .ToListAsync();

        var dtos = payments.Select(tp => new TuitionPaymentDto(
            Id:              tp.Id,
            ClassId:         tp.ClassId,
            ClassName:       cls.Name,
            StudentId:       tp.StudentId,
            StudentName:     tp.Student.User.FullName,
            StudentEmail:    tp.Student.User.Email,
            Month:           tp.Month,
            Year:            tp.Year,
            Amount:          tp.Amount,
            Status:          tp.Status,
            PaymentMethod:   tp.PaymentMethod,
            TransactionCode: tp.TransactionCode,
            PaidAt:          tp.PaidAt,
            ConfirmedBy:     tp.ConfirmedBy,
            ConfirmedAt:     tp.ConfirmedAt,
            Note:            tp.Note
        )).ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    // ── PUT /api/classes/tuitions/{paymentId}/confirm ─────────────────────────
    [HttpPut("tuitions/{paymentId:guid}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ConfirmTuitionPayment(Guid paymentId, [FromBody] ConfirmTuitionPaymentRequest req)
    {
        var payment = await db.TuitionPayments
            .Include(tp => tp.Class)
            .FirstOrDefaultAsync(tp => tp.Id == paymentId);

        if (payment == null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy thông tin đóng học phí"));

        payment.Status = req.Status;
        payment.ConfirmedBy = UserId;
        payment.ConfirmedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(req.Note))
        {
            payment.Note = req.Note;
        }

        // Cập nhật ClassMember nếu là tháng hiện tại
        if (payment.Month == DateTime.UtcNow.Month && payment.Year == DateTime.UtcNow.Year)
        {
            var member = await db.ClassMembers
                .FirstOrDefaultAsync(m => m.ClassId == payment.ClassId && m.StudentId == payment.StudentId);
            if (member != null)
            {
                member.TuitionStatus = req.Status == "paid" ? "paid" : "unpaid";
            }
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Xác nhận trạng thái học phí thành công"));
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

    // ── PUT /api/classes/{id}/members/{memberId}/tuition ──────────────────────

    [HttpPut("{id:guid}/members/{memberId:guid}/tuition")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateMemberTuition(Guid id, Guid memberId, [FromBody] UpdateMemberTuitionRequest req)
    {
        var member = await db.ClassMembers.FirstOrDefaultAsync(m => m.ClassId == id && m.Id == memberId);
        if (member is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy thành viên"));

        member.TuitionStatus = req.TuitionStatus;
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật học phí thành công"));
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

    // ── SESSIONS ENDPOINTS ───────────────────────────────────────────────────

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

    // ── DOCUMENTS ENDPOINTS ──────────────────────────────────────────────────

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

        var doc = new ClassDocument
        {
            Id = Guid.NewGuid(),
            ClassId = id,
            SessionId = req.SessionId,
            Title = req.Title,
            FileUrl = req.FileUrl,
            FileType = req.FileType,
            FileSizeKb = req.FileSizeKb,
            UploadedBy = UserId,
            CreatedAt = DateTime.UtcNow
        };

        db.ClassDocuments.Add(doc);
        await db.SaveChangesAsync();

        return StatusCode(201, ApiResponse.Created(new { doc.Id }, "Thêm tài liệu thành công"));
    }

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

    // ── ASSIGNMENTS ENDPOINTS ────────────────────────────────────────────────

    [HttpGet("{id:guid}/assignments")]
    public async Task<IActionResult> GetAssignments(Guid id)
    {
        var isStudent = User.IsInRole("Student");
        Guid? studentId = null;

        if (isStudent)
        {
            var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
            if (profile != null) studentId = profile.Id;
        }

        var assignments = await db.ClassAssignments
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
                    .ThenInclude(st => st.User)
            .Where(a => a.ClassId == id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var dtos = assignments.Select(a => {
            AssignmentSubmissionDto? submissionDto = null;
            if (isStudent && studentId.HasValue)
            {
                var sub = a.Submissions.FirstOrDefault(s => s.StudentId == studentId.Value);
                if (sub != null)
                {
                    submissionDto = new AssignmentSubmissionDto(
                        Id: sub.Id,
                        AssignmentId: sub.AssignmentId,
                        AssignmentTitle: a.Title,
                        StudentId: sub.StudentId,
                        StudentName: sub.Student.User.FullName,
                        StudentEmail: sub.Student.User.Email,
                        SubmissionText: sub.SubmissionText,
                        FileUrl: sub.FileUrl,
                        FileName: sub.FileName,
                        AnswersJson: sub.AnswersJson,
                        SubmittedAt: sub.SubmittedAt,
                        Grade: sub.Grade,
                        TeacherFeedback: sub.TeacherFeedback
                    );
                }
            }

            return new ClassAssignmentDto(
                Id: a.Id,
                ClassId: a.ClassId,
                Title: a.Title,
                Description: a.Description,
                DueDate: a.DueDate,
                CreatedAt: a.CreatedAt,
                AssignmentType: a.AssignmentType,
                AllowLateSubmission: a.AllowLateSubmission,
                QuestionsJson: a.QuestionsJson,
                Submission: submissionDto,
                SubmissionsCount: a.Submissions.Count
            );
        }).ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    [HttpGet("assignments/{assignmentId:guid}")]
    public async Task<IActionResult> GetAssignmentDetail(Guid assignmentId)
    {
        var a = await db.ClassAssignments
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
                    .ThenInclude(st => st.User)
            .FirstOrDefaultAsync(x => x.Id == assignmentId);

        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        var isStudent = User.IsInRole("Student");
        AssignmentSubmissionDto? submissionDto = null;

        if (isStudent)
        {
            var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
            if (profile != null)
            {
                var sub = a.Submissions.FirstOrDefault(s => s.StudentId == profile.Id);
                if (sub != null)
                {
                    submissionDto = new AssignmentSubmissionDto(
                        Id: sub.Id,
                        AssignmentId: sub.AssignmentId,
                        AssignmentTitle: a.Title,
                        StudentId: sub.StudentId,
                        StudentName: sub.Student.User.FullName,
                        StudentEmail: sub.Student.User.Email,
                        SubmissionText: sub.SubmissionText,
                        FileUrl: sub.FileUrl,
                        FileName: sub.FileName,
                        AnswersJson: sub.AnswersJson,
                        SubmittedAt: sub.SubmittedAt,
                        Grade: sub.Grade,
                        TeacherFeedback: sub.TeacherFeedback
                    );
                }
            }
        }

        var dto = new ClassAssignmentDto(
            Id: a.Id,
            ClassId: a.ClassId,
            Title: a.Title,
            Description: a.Description,
            DueDate: a.DueDate,
            CreatedAt: a.CreatedAt,
            AssignmentType: a.AssignmentType,
            AllowLateSubmission: a.AllowLateSubmission,
            QuestionsJson: a.QuestionsJson,
            Submission: submissionDto,
            SubmissionsCount: a.Submissions.Count
        );

        return Ok(ApiResponse.Ok(dto));
    }

    [HttpPost("{id:guid}/assignments")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateAssignment(Guid id, [FromBody] CreateAssignmentRequest req)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var assignment = new ClassAssignment
        {
            Id = Guid.NewGuid(),
            ClassId = id,
            Title = req.Title,
            Description = req.Description,
            DueDate = req.DueDate,
            AssignmentType = req.AssignmentType ?? "Upload",
            AllowLateSubmission = req.AllowLateSubmission ?? true,
            QuestionsJson = req.QuestionsJson,
            CreatedAt = DateTime.UtcNow
        };

        db.ClassAssignments.Add(assignment);
        await db.SaveChangesAsync();

        return StatusCode(201, ApiResponse.Created(new { assignment.Id }, "Giao bài tập thành công"));
    }

    [HttpPut("assignments/{assignmentId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdateAssignment(Guid assignmentId, [FromBody] UpdateAssignmentRequest req)
    {
        var a = await db.ClassAssignments.FindAsync(assignmentId);
        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        if (req.Title != null) a.Title = req.Title;
        if (req.Description != null) a.Description = req.Description;
        if (req.AssignmentType != null) a.AssignmentType = req.AssignmentType;
        if (req.AllowLateSubmission.HasValue) a.AllowLateSubmission = req.AllowLateSubmission.Value;
        if (req.QuestionsJson != null) a.QuestionsJson = req.QuestionsJson;
        a.DueDate = req.DueDate;

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật bài tập thành công"));
    }

    [HttpDelete("assignments/{assignmentId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteAssignment(Guid assignmentId)
    {
        var a = await db.ClassAssignments.FindAsync(assignmentId);
        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        db.ClassAssignments.Remove(a);
        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Xóa bài tập thành công"));
    }

    // ── SUBMISSIONS ENDPOINTS ────────────────────────────────────────────────

    [HttpGet("assignments/{assignmentId:guid}/submissions")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetAssignmentSubmissions(Guid assignmentId)
    {
        var submissions = await db.AssignmentSubmissions
            .Include(s => s.Student)
                .ThenInclude(st => st.User)
            .Include(s => s.Assignment)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var dtos = submissions.Select(s => new AssignmentSubmissionDto(
            Id: s.Id,
            AssignmentId: s.AssignmentId,
            AssignmentTitle: s.Assignment.Title,
            StudentId: s.StudentId,
            StudentName: s.Student.User.FullName,
            StudentEmail: s.Student.User.Email,
            SubmissionText: s.SubmissionText,
            FileUrl: s.FileUrl,
            FileName: s.FileName,
            AnswersJson: s.AnswersJson,
            SubmittedAt: s.SubmittedAt,
            Grade: s.Grade,
            TeacherFeedback: s.TeacherFeedback
        )).ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    [HttpPost("assignments/{assignmentId:guid}/submit")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> SubmitAssignment(Guid assignmentId, [FromBody] SubmitAssignmentRequest req)
    {
        var a = await db.ClassAssignments.FindAsync(assignmentId);
        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        // Kiểm tra chặn nộp trễ nếu quá hạn
        if (a.DueDate.HasValue && !a.AllowLateSubmission && DateTime.UtcNow > a.DueDate.Value)
        {
            return BadRequest(ApiResponse.BadRequest("Đã quá hạn nộp bài. Lớp học không cho phép nộp trễ."));
        }

        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null) return BadRequest(ApiResponse.BadRequest("Không tìm thấy hồ sơ học viên"));

        var sub = await db.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == profile.Id);

        if (sub != null)
        {
            sub.SubmissionText = req.SubmissionText;
            sub.FileUrl = req.FileUrl;
            sub.FileName = req.FileName;
            sub.SubmittedAt = DateTime.UtcNow;
            sub.AnswersJson = req.AnswersJson;
        }
        else
        {
            sub = new AssignmentSubmission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignmentId,
                StudentId = profile.Id,
                SubmissionText = req.SubmissionText,
                FileUrl = req.FileUrl,
                FileName = req.FileName,
                AnswersJson = req.AnswersJson,
                SubmittedAt = DateTime.UtcNow
            };
            db.AssignmentSubmissions.Add(sub);
        }

        // Tự động chấm điểm cho loại bài tập Quiz
        if (a.AssignmentType == "Quiz" && !string.IsNullOrWhiteSpace(req.AnswersJson))
        {
            try
            {
                var questions = string.IsNullOrWhiteSpace(a.QuestionsJson)
                    ? new List<AssignmentQuestionDto>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<AssignmentQuestionDto>>(
                        a.QuestionsJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var answers = System.Text.Json.JsonSerializer.Deserialize<List<StudentAnswerDto>>(
                    req.AnswersJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (questions != null && answers != null)
                {
                    var gradedAnswers = new List<StudentAnswerDto>();
                    float autoGradedTotalScore = 0;
                    bool hasWritingQuestions = false;

                    foreach (var answer in answers)
                    {
                        var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                        if (question != null)
                        {
                            var qType = question.Type;
                            if (qType == "MultipleChoice" || qType == "TrueFalse" || qType == "FillInTheBlank")
                            {
                                var studentAns = (answer.AnswerText ?? "").Trim().ToLowerInvariant();
                                var correctAns = (question.CorrectAnswer ?? "").Trim().ToLowerInvariant();
                                bool isCorrect = studentAns == correctAns;

                                gradedAnswers.Add(new StudentAnswerDto(
                                    QuestionId: answer.QuestionId,
                                    AnswerText: answer.AnswerText,
                                    IsCorrect: isCorrect,
                                    Grade: isCorrect ? question.Points : 0,
                                    TeacherFeedback: null
                                ));

                                if (isCorrect)
                                {
                                    autoGradedTotalScore += question.Points;
                                }
                            }
                            else if (qType == "ShortAnswer")
                            {
                                if (!string.IsNullOrWhiteSpace(question.CorrectAnswer))
                                {
                                    var studentAns = (answer.AnswerText ?? "").Trim().ToLowerInvariant();
                                    var correctAns = (question.CorrectAnswer ?? "").Trim().ToLowerInvariant();
                                    bool isCorrect = studentAns == correctAns;

                                    gradedAnswers.Add(new StudentAnswerDto(
                                        QuestionId: answer.QuestionId,
                                        AnswerText: answer.AnswerText,
                                        IsCorrect: isCorrect,
                                        Grade: isCorrect ? question.Points : 0,
                                        TeacherFeedback: null
                                    ));

                                    if (isCorrect)
                                    {
                                        autoGradedTotalScore += question.Points;
                                    }
                                }
                                else
                                {
                                    hasWritingQuestions = true;
                                    gradedAnswers.Add(new StudentAnswerDto(
                                        QuestionId: answer.QuestionId,
                                        AnswerText: answer.AnswerText,
                                        IsCorrect: null,
                                        Grade: null,
                                        TeacherFeedback: null
                                    ));
                                }
                            }
                            else // Writing
                            {
                                hasWritingQuestions = true;
                                gradedAnswers.Add(new StudentAnswerDto(
                                    QuestionId: answer.QuestionId,
                                    AnswerText: answer.AnswerText,
                                    IsCorrect: null,
                                    Grade: null,
                                    TeacherFeedback: null
                                ));
                            }
                        }
                    }

                    sub.AnswersJson = System.Text.Json.JsonSerializer.Serialize(gradedAnswers);

                    if (!hasWritingQuestions)
                    {
                        sub.Grade = autoGradedTotalScore;
                    }
                    else
                    {
                        sub.Grade = null; // Chờ giáo viên chấm điểm phần tự luận
                    }
                }
            }
            catch
            {
                // Bỏ qua nếu có lỗi parse JSON và lưu chuỗi thô
                sub.AnswersJson = req.AnswersJson;
            }
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok(new { sub.Id }, "Nộp bài tập thành công"));
    }

    [HttpPost("assignments/submissions/{submissionId:guid}/grade")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionRequest req)
    {
        var sub = await db.AssignmentSubmissions.FindAsync(submissionId);
        if (sub == null) return NotFound(ApiResponse.NotFound("Không tìm thấy bài nộp"));

        sub.Grade = req.Grade;
        sub.TeacherFeedback = req.TeacherFeedback;
        if (!string.IsNullOrWhiteSpace(req.AnswersJson))
        {
            sub.AnswersJson = req.AnswersJson;
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Chấm điểm bài nộp thành công"));
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

    // ── ANNOUNCEMENTS ENDPOINTS ─────────────────────────────────────────────

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
}
