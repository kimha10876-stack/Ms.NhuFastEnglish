using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;

namespace MsNhuFastEnglishAPI.Services.PaymentServices;

public class PaymentService(
    AppDbContext db,
    PaymentGatewayFactory gatewayFactory,
    IConfiguration config,
    ILogger<PaymentService> logger
) : IPaymentService
{
    private static long GenerateUniqueOrderCode()
    {
        // Sinh số nguyên unique cho OrderCode (timestamp ms + random 3 chữ số, nhỏ hơn 9007199254740991 của PayOS)
        var ms = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        // Lấy 11 số cuối để đảm bảo an toàn nằm trong phạm vi long và int JS
        var baseNum = ms % 10000000000;
        return baseNum * 100 + Random.Shared.Next(10, 99);
    }

    public async Task<(PaymentResponseDto? Result, string? Error)> CreatePaymentOrderAsync(Guid userId, CreatePaymentRequest req)
    {
        var user = await db.Users.FindAsync(userId);
        if (user == null) return (null, "Không tìm thấy thông tin tài khoản");

        var studentProfile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (studentProfile == null)
        {
            studentProfile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Level = "Mới bắt đầu",
                Goal = "Giao tiếp cơ bản",
                Status = "active"
            };
            db.StudentProfiles.Add(studentProfile);
            await db.SaveChangesAsync();
        }

        Class? cls = null;
        decimal amount = req.CustomAmount ?? 0;

        if (req.ClassId.HasValue)
        {
            cls = await db.Classes.FindAsync(req.ClassId.Value);
            if (cls == null) return (null, "Lớp học không tồn tại");

            if (!req.CustomAmount.HasValue || req.CustomAmount.Value <= 0)
            {
                amount = cls.MonthlyFee > 0 ? cls.MonthlyFee : 5000;
            }
        }

        if (amount <= 0)
        {
            amount = 5000;
        }

        var orderCode = GenerateUniqueOrderCode();
        var paymentCode = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";

        var defaultDescription = req.Description ?? (cls != null
            ? $"Hoc phi {cls.Name} T{req.BillingMonth ?? DateTime.UtcNow.Month}"
            : "Thanh toan hoc phi");

        var appUrl = config["AppUrl"] ?? config["FRONTEND_URL"] ?? "http://localhost:5173";
        var returnUrl = !string.IsNullOrWhiteSpace(req.ReturnUrl) ? req.ReturnUrl : $"{appUrl}/payment/success";
        var cancelUrl = !string.IsNullOrWhiteSpace(req.CancelUrl) ? req.CancelUrl : $"{appUrl}/payment/cancel";

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderCode = orderCode,
            PaymentCode = paymentCode,
            UserId = userId,
            StudentProfileId = studentProfile.Id,
            ClassId = req.ClassId,
            Amount = amount,
            DiscountAmount = 0,
            FinalAmount = amount,
            Currency = "VND",
            PaymentType = req.PaymentType,
            Status = "Pending",
            PaymentMethod = req.PaymentMethod,
            BillingMonth = req.BillingMonth ?? DateTime.UtcNow.Month,
            BillingYear = req.BillingYear ?? DateTime.UtcNow.Year,
            Description = defaultDescription,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30), // Hạn thanh toán 30 phút
            CreatedAt = DateTime.UtcNow
        };

        // Gọi Gateway sinh link & mã QR
        try
        {
            var gateway = gatewayFactory.GetGateway(req.PaymentMethod);
            var gatewayResult = await gateway.CreatePaymentLinkAsync(payment, returnUrl, cancelUrl);

            if (!gatewayResult.Success)
            {
                return (null, gatewayResult.ErrorMessage ?? "Không thể tạo liên kết thanh toán từ cổng");
            }

            payment.CheckoutUrl = gatewayResult.CheckoutUrl;
            payment.QrCode = gatewayResult.QrCode;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lỗi khi gọi gateway thanh toán {Method}", req.PaymentMethod);
            return (null, "Không thể kết nối tới cổng thanh toán: " + ex.Message);
        }

        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        var dto = new PaymentResponseDto(
            Id: payment.Id,
            OrderCode: payment.OrderCode,
            PaymentCode: payment.PaymentCode,
            UserId: payment.UserId,
            UserFullName: user.FullName,
            UserEmail: user.Email,
            ClassId: payment.ClassId,
            ClassName: cls?.Name,
            Amount: payment.Amount,
            DiscountAmount: payment.DiscountAmount,
            FinalAmount: payment.FinalAmount,
            Currency: payment.Currency,
            PaymentType: payment.PaymentType,
            Status: payment.Status,
            PaymentMethod: payment.PaymentMethod,
            BillingMonth: payment.BillingMonth,
            BillingYear: payment.BillingYear,
            Description: payment.Description,
            CheckoutUrl: payment.CheckoutUrl,
            QrCode: payment.QrCode,
            ExpiresAt: payment.ExpiresAt,
            CompletedAt: payment.CompletedAt,
            CreatedAt: payment.CreatedAt
        );

        return (dto, null);
    }

    public async Task<(PaymentDetailDto? Result, string? Error)> GetPaymentByIdAsync(Guid paymentId, Guid requestingUserId, bool isAdmin)
    {
        var payment = await db.Payments
            .Include(p => p.User)
            .Include(p => p.Class)
            .Include(p => p.Transactions.OrderByDescending(t => t.CreatedAt))
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null) return (null, "Không tìm thấy đơn thanh toán");

        if (!isAdmin && payment.UserId != requestingUserId)
        {
            return (null, "Bạn không có quyền xem thông tin đơn thanh toán này");
        }

        var transDtos = payment.Transactions.Select(t => new PaymentTransactionDto(
            Id: t.Id,
            PaymentId: t.PaymentId,
            TransactionReference: t.TransactionReference,
            Gateway: t.Gateway,
            Amount: t.Amount,
            Status: t.Status,
            Note: t.Note,
            PaidAt: t.PaidAt,
            CreatedAt: t.CreatedAt
        )).ToList();

        var dto = new PaymentDetailDto(
            Id: payment.Id,
            OrderCode: payment.OrderCode,
            PaymentCode: payment.PaymentCode,
            UserId: payment.UserId,
            UserFullName: payment.User.FullName,
            UserEmail: payment.User.Email,
            ClassId: payment.ClassId,
            ClassName: payment.Class?.Name,
            Amount: payment.Amount,
            DiscountAmount: payment.DiscountAmount,
            FinalAmount: payment.FinalAmount,
            Currency: payment.Currency,
            PaymentType: payment.PaymentType,
            Status: payment.Status,
            PaymentMethod: payment.PaymentMethod,
            BillingMonth: payment.BillingMonth,
            BillingYear: payment.BillingYear,
            Description: payment.Description,
            CheckoutUrl: payment.CheckoutUrl,
            QrCode: payment.QrCode,
            ExpiresAt: payment.ExpiresAt,
            CompletedAt: payment.CompletedAt,
            ConfirmedBy: payment.ConfirmedBy,
            Note: payment.Note,
            CreatedAt: payment.CreatedAt,
            Transactions: transDtos
        );

        return (dto, null);
    }

    public async Task<(PaymentStatusDto? Result, string? Error)> GetPaymentStatusAsync(Guid paymentId, Guid requestingUserId, bool isAdmin)
    {
        var payment = await db.Payments.FindAsync(paymentId);
        if (payment == null) return (null, "Không tìm thấy đơn thanh toán");

        if (!isAdmin && payment.UserId != requestingUserId)
        {
            return (null, "Bạn không có quyền truy cập trạng thái đơn này");
        }

        // Tự động kiểm tra quá hạn nếu còn Pending
        if (payment.Status == "Pending" && payment.ExpiresAt.HasValue && DateTime.UtcNow > payment.ExpiresAt.Value)
        {
            payment.Status = "Expired";
            payment.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        var isCompleted = payment.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase);
        var isPending = payment.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) || payment.Status.Equals("Processing", StringComparison.OrdinalIgnoreCase);
        var isFailed = payment.Status.Equals("Failed", StringComparison.OrdinalIgnoreCase) || payment.Status.Equals("Expired", StringComparison.OrdinalIgnoreCase) || payment.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase);

        var statusDto = new PaymentStatusDto(
            Id: payment.Id,
            OrderCode: payment.OrderCode,
            Status: payment.Status,
            IsCompleted: isCompleted,
            IsPending: isPending,
            IsFailed: isFailed,
            CompletedAt: payment.CompletedAt,
            Message: isCompleted ? "Thanh toán thành công" : isPending ? "Đang chờ thanh toán" : "Thanh toán chưa hoàn tất"
        );

        return (statusDto, null);
    }

    public async Task<PaginatedListDto<PaymentResponseDto>> GetMyPaymentsAsync(Guid userId, int page = 1, int pageSize = 10)
    {
        var query = db.Payments
            .Include(p => p.User)
            .Include(p => p.Class)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PaymentResponseDto(
                p.Id,
                p.OrderCode,
                p.PaymentCode,
                p.UserId,
                p.User.FullName,
                p.User.Email,
                p.ClassId,
                p.Class != null ? p.Class.Name : null,
                p.Amount,
                p.DiscountAmount,
                p.FinalAmount,
                p.Currency,
                p.PaymentType,
                p.Status,
                p.PaymentMethod,
                p.BillingMonth,
                p.BillingYear,
                p.Description,
                p.CheckoutUrl,
                p.QrCode,
                p.ExpiresAt,
                p.CompletedAt,
                p.CreatedAt
            ))
            .ToListAsync();

        return new PaginatedListDto<PaymentResponseDto>(
            Items: items,
            TotalCount: total,
            Page: page,
            PageSize: pageSize,
            TotalPages: (int)Math.Ceiling(total / (double)pageSize)
        );
    }

    public async Task<(bool Success, string? Error)> CancelPaymentAsync(Guid paymentId, Guid userId)
    {
        var payment = await db.Payments.FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId);
        if (payment == null) return (false, "Không tìm thấy đơn thanh toán");

        if (payment.Status != "Pending")
        {
            return (false, "Chỉ có thể hủy đơn đang trong trạng thái chờ thanh toán");
        }

        payment.Status = "Cancelled";
        payment.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> ProcessWebhookAsync(string gatewayName, string requestBody, string? signature)
    {
        try
        {
            var gateway = gatewayFactory.GetGateway(gatewayName);
            var (isValid, webhookResult) = await gateway.ProcessWebhookAsync(requestBody, signature);

            if (!isValid || webhookResult == null)
            {
                logger.LogWarning("Chữ ký Webhook từ cổng {Gateway} không hợp lệ", gatewayName);
                return (false, "Chữ ký số không hợp lệ");
            }

            var payment = await db.Payments
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.OrderCode == webhookResult.OrderCode);

            if (payment == null)
            {
                logger.LogWarning("Không tìm thấy đơn thanh toán với OrderCode: {OrderCode}", webhookResult.OrderCode);
                return (false, $"Không tìm thấy đơn thanh toán #{webhookResult.OrderCode}");
            }

            // ── IDEMPOTENCY CHECK: Tránh xử lý trùng lặp nếu webhook gửi nhiều lần ──
            if (payment.Status == "Completed")
            {
                logger.LogInformation("Đơn thanh toán {OrderCode} đã hoàn tất trước đó, bỏ qua xử lý trùng", payment.OrderCode);
                return (true, null);
            }

            // Ghi nhận transaction
            var transaction = new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                PaymentId = payment.Id,
                TransactionReference = webhookResult.TransactionRef,
                Gateway = gatewayName,
                Amount = webhookResult.Amount > 0 ? webhookResult.Amount : payment.FinalAmount,
                Status = webhookResult.Status,
                GatewayResponse = webhookResult.RawPayload,
                Note = "Giao dịch thanh toán tự động qua Webhook " + gatewayName,
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            db.PaymentTransactions.Add(transaction);

            if (webhookResult.Status.Equals("Success", StringComparison.OrdinalIgnoreCase))
            {
                payment.Status = "Completed";
                payment.CompletedAt = DateTime.UtcNow;
                payment.UpdatedAt = DateTime.UtcNow;

                // Tự động kích hoạt thành viên lớp nếu thanh toán đăng ký lớp
                if (payment.ClassId.HasValue && payment.StudentProfileId.HasValue)
                {
                    var isMember = await db.ClassMembers.AnyAsync(m => m.ClassId == payment.ClassId.Value && m.StudentId == payment.StudentProfileId.Value);
                    if (!isMember)
                    {
                        var member = new ClassMember
                        {
                            Id = Guid.NewGuid(),
                            ClassId = payment.ClassId.Value,
                            StudentId = payment.StudentProfileId.Value,
                            Status = "active",
                            JoinedAt = DateTime.UtcNow
                        };
                        db.ClassMembers.Add(member);
                    }
                }
            }
            else
            {
                payment.Status = "Failed";
                payment.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync();
            logger.LogInformation("Xử lý Webhook thành công cho đơn thanh toán #{OrderCode}, Trạng thái: {Status}", payment.OrderCode, payment.Status);

            return (true, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lỗi khi xử lý webhook từ cổng {Gateway}", gatewayName);
            return (false, ex.Message);
        }
    }

    public async Task<PaginatedListDto<PaymentResponseDto>> GetAdminPaymentsAsync(AdminPaymentFilterRequest filter)
    {
        var query = db.Payments
            .Include(p => p.User)
            .Include(p => p.Class)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(p => p.Status.ToLower() == filter.Status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(filter.PaymentMethod))
        {
            query = query.Where(p => p.PaymentMethod.ToLower() == filter.PaymentMethod.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(filter.PaymentType))
        {
            query = query.Where(p => p.PaymentType.ToLower() == filter.PaymentType.ToLower());
        }

        if (filter.ClassId.HasValue)
        {
            query = query.Where(p => p.ClassId == filter.ClassId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(p =>
                p.PaymentCode.ToLower().Contains(s) ||
                p.OrderCode.ToString().Contains(s) ||
                p.User.FullName.ToLower().Contains(s) ||
                p.User.Email.ToLower().Contains(s) ||
                p.Description.ToLower().Contains(s)
            );
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => new PaymentResponseDto(
                p.Id,
                p.OrderCode,
                p.PaymentCode,
                p.UserId,
                p.User.FullName,
                p.User.Email,
                p.ClassId,
                p.Class != null ? p.Class.Name : null,
                p.Amount,
                p.DiscountAmount,
                p.FinalAmount,
                p.Currency,
                p.PaymentType,
                p.Status,
                p.PaymentMethod,
                p.BillingMonth,
                p.BillingYear,
                p.Description,
                p.CheckoutUrl,
                p.QrCode,
                p.ExpiresAt,
                p.CompletedAt,
                p.CreatedAt
            ))
            .ToListAsync();

        return new PaginatedListDto<PaymentResponseDto>(
            Items: items,
            TotalCount: total,
            Page: filter.Page,
            PageSize: filter.PageSize,
            TotalPages: (int)Math.Ceiling(total / (double)filter.PageSize)
        );
    }

    public async Task<(bool Success, string? Error)> ManualConfirmPaymentAsync(Guid paymentId, Guid adminUserId, ManualConfirmPaymentRequest req)
    {
        var payment = await db.Payments.FindAsync(paymentId);
        if (payment == null) return (false, "Không tìm thấy đơn thanh toán");

        payment.Status = "Completed";
        payment.CompletedAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        payment.ConfirmedBy = adminUserId;
        payment.Note = req.Note ?? "Admin xác nhận thủ công";

        var trans = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            PaymentId = payment.Id,
            TransactionReference = req.TransactionCode ?? $"MANUAL-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Gateway = "Cash/Manual",
            Amount = payment.FinalAmount,
            Status = "Success",
            Note = req.Note ?? "Xác nhận thu trực tiếp tại quầy",
            PaidAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
        db.PaymentTransactions.Add(trans);

        // Kích hoạt học viên vào lớp nếu cần
        if (payment.ClassId.HasValue && payment.StudentProfileId.HasValue)
        {
            var isMember = await db.ClassMembers.AnyAsync(m => m.ClassId == payment.ClassId.Value && m.StudentId == payment.StudentProfileId.Value);
            if (!isMember)
            {
                var member = new ClassMember
                {
                    Id = Guid.NewGuid(),
                    ClassId = payment.ClassId.Value,
                    StudentId = payment.StudentProfileId.Value,
                    Status = "active",
                    JoinedAt = DateTime.UtcNow
                };
                db.ClassMembers.Add(member);
            }
        }

        await db.SaveChangesAsync();
        return (true, null);
    }
}
