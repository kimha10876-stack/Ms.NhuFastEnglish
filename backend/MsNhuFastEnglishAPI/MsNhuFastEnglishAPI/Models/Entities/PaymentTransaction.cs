using System;

namespace MsNhuFastEnglishAPI.Models.Entities;

/// <summary>
/// Đại diện cho một lần giao dịch thực tế từ cổng thanh toán hoặc ngân hàng.
/// Một Payment có thể phát sinh nhiều PaymentTransactions (lịch sử thử lại, thất bại, thành công).
/// </summary>
public class PaymentTransaction
{
    public Guid Id { get; set; }

    /// <summary>Khóa ngoại trỏ đến Đơn thanh toán (Payment)</summary>
    public Guid PaymentId { get; set; }

    /// <summary>
    /// Mã giao dịch thực tế do cổng thanh toán hoặc ngân hàng sinh ra
    /// (PayOS transaction id, VNPay vnp_TransactionNo, MoMo transId)
    /// </summary>
    public string? TransactionReference { get; set; }

    /// <summary>
    /// Tên cổng giao dịch: "PayOS" | "VNPAY" | "MoMo" | "ManualBank" | "Cash"
    /// </summary>
    public string Gateway { get; set; } = default!;

    /// <summary>Số tiền giao dịch thực tế</summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Trạng thái giao dịch: "Success" | "Pending" | "Failed"
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Toàn bộ chuỗi JSON trả về từ Webhook / IPN / Callback của cổng thanh toán.
    /// Dùng cho việc đối soát dòng tiền và giải quyết khiếu nại.
    /// </summary>
    public string? GatewayResponse { get; set; }

    /// <summary>Ghi chú lỗi hoặc lý do từ cổng</summary>
    public string? Note { get; set; }

    /// <summary>Thời điểm ngân hàng / cổng trừ tiền thành công</summary>
    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation Property ──
    public Payment Payment { get; set; } = default!;
}
