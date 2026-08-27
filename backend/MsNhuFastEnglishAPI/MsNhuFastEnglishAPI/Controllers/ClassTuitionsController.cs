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
public class ClassTuitionsController(AppDbContext db) : ControllerBase
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
}
