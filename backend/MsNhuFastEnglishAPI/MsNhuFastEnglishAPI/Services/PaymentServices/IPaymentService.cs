using System;
using System.Threading.Tasks;
using MsNhuFastEnglishAPI.Models.DTOs;

namespace MsNhuFastEnglishAPI.Services.PaymentServices;

public interface IPaymentService
{
    Task<(PaymentResponseDto? Result, string? Error)> CreatePaymentOrderAsync(Guid userId, CreatePaymentRequest req);
    Task<(PaymentDetailDto? Result, string? Error)> GetPaymentByIdAsync(Guid paymentId, Guid requestingUserId, bool isAdmin);
    Task<(PaymentStatusDto? Result, string? Error)> GetPaymentStatusAsync(Guid paymentId, Guid requestingUserId, bool isAdmin);
    Task<PaginatedListDto<PaymentResponseDto>> GetMyPaymentsAsync(Guid userId, int page = 1, int pageSize = 10);
    Task<(bool Success, string? Error)> CancelPaymentAsync(Guid paymentId, Guid userId);
    Task<(bool Success, string? Error)> ProcessWebhookAsync(string gatewayName, string requestBody, string? signature);
    Task<PaginatedListDto<PaymentResponseDto>> GetAdminPaymentsAsync(AdminPaymentFilterRequest filter);
    Task<(bool Success, string? Error)> ManualConfirmPaymentAsync(Guid paymentId, Guid adminUserId, ManualConfirmPaymentRequest req);
}
