using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record CreatePaymentRequest(
    Guid?   ClassId,
    string  PaymentType = "TuitionMonthly", // "TuitionMonthly" | "ClassEnrollment" | "CoursePackage"
    string  PaymentMethod = "PayOS",        // "PayOS"
    int?    BillingMonth = null,
    int?    BillingYear = null,
    decimal? CustomAmount = null,          // Cho phép admin/học viên đóng theo số tiền cụ thể nếu khác học phí lớp
    string? Description = null,
    string? ReturnUrl = null,
    string? CancelUrl = null
);

public record PaymentResponseDto(
    Guid      Id,
    long      OrderCode,
    string    PaymentCode,
    Guid      UserId,
    string    UserFullName,
    string    UserEmail,
    Guid?     ClassId,
    string?   ClassName,
    decimal   Amount,
    decimal   DiscountAmount,
    decimal   FinalAmount,
    string    Currency,
    string    PaymentType,
    string    Status,
    string    PaymentMethod,
    int?      BillingMonth,
    int?      BillingYear,
    string    Description,
    string?   CheckoutUrl,
    string?   QrCode,
    DateTime? ExpiresAt,
    DateTime? CompletedAt,
    DateTime  CreatedAt
);

public record PaymentDetailDto(
    Guid                          Id,
    long                          OrderCode,
    string                        PaymentCode,
    Guid                          UserId,
    string                        UserFullName,
    string                        UserEmail,
    Guid?                         ClassId,
    string?                       ClassName,
    decimal                       Amount,
    decimal                       DiscountAmount,
    decimal                       FinalAmount,
    string                        Currency,
    string                        PaymentType,
    string                        Status,
    string                        PaymentMethod,
    int?                          BillingMonth,
    int?                          BillingYear,
    string                        Description,
    string?                       CheckoutUrl,
    string?                       QrCode,
    DateTime?                     ExpiresAt,
    DateTime?                     CompletedAt,
    Guid?                         ConfirmedBy,
    string?                       Note,
    DateTime                      CreatedAt,
    IList<PaymentTransactionDto> Transactions
);

public record PaymentTransactionDto(
    Guid      Id,
    Guid      PaymentId,
    string?   TransactionReference,
    string    Gateway,
    decimal   Amount,
    string    Status,
    string?   Note,
    DateTime? PaidAt,
    DateTime  CreatedAt
);

public record PaymentStatusDto(
    Guid      Id,
    long      OrderCode,
    string    Status,
    bool      IsCompleted,
    bool      IsPending,
    bool      IsFailed,
    DateTime? CompletedAt,
    string?   Message
);

public record AdminPaymentFilterRequest(
    string?   Status = null,
    string?   PaymentMethod = null,
    string?   PaymentType = null,
    Guid?     ClassId = null,
    string?   Search = null,
    int       Page = 1,
    int       PageSize = 15
);

public record ManualConfirmPaymentRequest(
    string? TransactionCode,
    string? Note
);
