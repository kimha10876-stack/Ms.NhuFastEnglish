using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.Entities;

/// <summary>
/// Đại diện cho một Đơn thanh toán / Yêu cầu thanh toán (Payment Order)
/// </summary>
public class Payment
{
    public Guid Id { get; set; }

    /// <summary>
    /// Mã thanh toán số nguyên duy nhất (tương thích chuẩn PayOS yêu cầu OrderCode kiểu long/int)
    /// </summary>
    public long OrderCode { get; set; }

    /// <summary>
    /// Mã thanh toán chuỗi thân thiện với người dùng (ví dụ: "PAY-2026-0001")
    /// </summary>
    public string PaymentCode { get; set; } = default!;

    /// <summary>Tài khoản người tạo đơn thanh toán</summary>
    public Guid UserId { get; set; }

    /// <summary>Hồ sơ học viên được áp dụng (nếu có)</summary>
    public Guid? StudentProfileId { get; set; }

    /// <summary>Lớp học liên quan (nếu là đóng học phí hoặc mua theo lớp)</summary>
    public Guid? ClassId { get; set; }

    /// <summary>Số tiền gốc (VNĐ)</summary>
    public decimal Amount { get; set; }

    /// <summary>Số tiền giảm giá / khuyến mãi</summary>
    public decimal DiscountAmount { get; set; } = 0;

    /// <summary>Số tiền thực tế phải thanh toán (FinalAmount = Amount - DiscountAmount)</summary>
    public decimal FinalAmount { get; set; }

    /// <summary>Đơn vị tiền tệ: mặc định "VND"</summary>
    public string Currency { get; set; } = "VND";

    /// <summary>
    /// Loại thanh toán:
    /// "TuitionMonthly" (Học phí định kỳ theo tháng) |
    /// "ClassEnrollment" (Đăng ký học phí trọn gói lớp) |
    /// "CoursePackage" (Mua khóa học)
    /// </summary>
    public string PaymentType { get; set; } = "TuitionMonthly";

    /// <summary>
    /// Trạng thái thanh toán:
    /// "Pending" (Chờ thanh toán) |
    /// "Processing" (Đang xử lý) |
    /// "Completed" (Đã thanh toán thành công) |
    /// "Failed" (Thanh toán thất bại) |
    /// "Cancelled" (Đã hủy) |
    /// "Expired" (Hết hạn thanh toán) |
    /// "Refunded" (Đã hoàn tiền)
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Cổng / Phương thức thanh toán:
    /// "PayOS" | "VNPAY" | "MoMo" | "BankTransfer" | "Cash"
    /// </summary>
    public string PaymentMethod { get; set; } = "PayOS";

    /// <summary>Kỳ học phí áp dụng (nếu là đóng học phí tháng)</summary>
    public int? BillingMonth { get; set; }
    public int? BillingYear { get; set; }

    /// <summary>Nội dung mô tả đơn thanh toán</summary>
    public string Description { get; set; } = default!;

    /// <summary>Đường link thanh toán từ cổng (PayOS/VNPay checkout URL)</summary>
    public string? CheckoutUrl { get; set; }

    /// <summary>Chuỗi mã QR thanh toán dạng chuỗi hoặc Base64</summary>
    public string? QrCode { get; set; }

    /// <summary>Thời điểm đơn thanh toán hết hạn</summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>Thời điểm thanh toán thành công</summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>Admin xác nhận thủ công (nếu thu tiền mặt hoặc chuyển khoản ngoài)</summary>
    public Guid? ConfirmedBy { get; set; }

    /// <summary>Ghi chú nội bộ</summary>
    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // ── Navigation Properties ──
    public User User { get; set; } = default!;
    public StudentProfile? StudentProfile { get; set; }
    public Class? Class { get; set; }
    public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
}
