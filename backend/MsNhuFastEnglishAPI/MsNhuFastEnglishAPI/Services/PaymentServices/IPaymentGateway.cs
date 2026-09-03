using System.Threading.Tasks;
using MsNhuFastEnglishAPI.Models.Entities;

namespace MsNhuFastEnglishAPI.Services.PaymentServices;

public record GatewayPaymentResult(
    bool Success,
    string? CheckoutUrl,
    string? QrCode,
    string? ErrorMessage,
    string? TransactionRef = null
);

public record GatewayWebhookResult(
    bool Success,
    long OrderCode,
    decimal Amount,
    string? TransactionRef,
    string Status, // "Success" | "Failed"
    string RawPayload,
    string? ErrorMessage = null
);

public interface IPaymentGateway
{
    string GatewayName { get; }
    Task<GatewayPaymentResult> CreatePaymentLinkAsync(Payment payment, string returnUrl, string cancelUrl);
    Task<(bool IsValid, GatewayWebhookResult? Result)> ProcessWebhookAsync(string requestBody, string? signature);
}
