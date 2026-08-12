using System;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class TuitionPayment
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Guid StudentId { get; set; } // FK to StudentProfile
    public int Month { get; set; } // 1-12
    public int Year { get; set; }
    public decimal Amount { get; set; }
    /// <summary>"paid" | "pending" | "rejected"</summary>
    public string Status { get; set; } = "paid";
    /// <summary>"VietQR" | "Transfer" | "OnlineGateway" | "Cash"</summary>
    public string PaymentMethod { get; set; } = "VietQR";
    public string? TransactionCode { get; set; }
    public DateTime PaidAt { get; set; }
    public Guid? ConfirmedBy { get; set; } // Admin UserId who confirmed
    public DateTime? ConfirmedAt { get; set; }
    public string? Note { get; set; }

    public Class Class { get; set; } = default!;
    public StudentProfile Student { get; set; } = default!;
}
