using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MsNhuFastEnglishAPI.Models.Entities;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;

namespace MsNhuFastEnglishAPI.Services.PaymentServices;

public class PayOSGatewayService : IPaymentGateway
{
    private readonly PayOSClient _client;
    private readonly ILogger<PayOSGatewayService> _logger;

    public string GatewayName => "PayOS";

    public PayOSGatewayService(IConfiguration configuration, ILogger<PayOSGatewayService> logger)
    {
        _logger = logger;
        var clientId = configuration["PayOS:ClientId"] ?? configuration["PAYOS_CLIENT_ID"] ?? Environment.GetEnvironmentVariable("PAYOS_CLIENT_ID") ?? "";
        var apiKey = configuration["PayOS:ApiKey"] ?? configuration["PAYOS_API_KEY"] ?? Environment.GetEnvironmentVariable("PAYOS_API_KEY") ?? "";
        var checksumKey = configuration["PayOS:ChecksumKey"] ?? configuration["PAYOS_CHECKSUM_KEY"] ?? Environment.GetEnvironmentVariable("PAYOS_CHECKSUM_KEY") ?? "";

        var options = new PayOSOptions
        {
            ClientId = clientId,
            ApiKey = apiKey,
            ChecksumKey = checksumKey
        };

        _client = new PayOSClient(options);
    }

    public async Task<GatewayPaymentResult> CreatePaymentLinkAsync(Payment payment, string returnUrl, string cancelUrl)
    {
        try
        {
            var items = new List<PaymentLinkItem>
            {
                new()
                {
                    Name = string.IsNullOrWhiteSpace(payment.Description) ? "Hoc phi Ms Nhu" : payment.Description,
                    Quantity = 1,
                    Price = (long)payment.FinalAmount
                }
            };

            // PayOS description: tối đa 25 ký tự không dấu
            var safeDesc = $"MSNHU{payment.OrderCode}";
            if (safeDesc.Length > 25) safeDesc = safeDesc[..25];

            var request = new CreatePaymentLinkRequest
            {
                OrderCode = payment.OrderCode,
                Amount = (long)payment.FinalAmount,
                Description = safeDesc,
                Items = items,
                CancelUrl = cancelUrl,
                ReturnUrl = returnUrl
            };

            var response = await _client.PaymentRequests.CreateAsync(request);

            return new GatewayPaymentResult(
                Success: true,
                CheckoutUrl: response.CheckoutUrl,
                QrCode: response.QrCode,
                ErrorMessage: null,
                TransactionRef: response.PaymentLinkId
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo payment link trên PayOS cho đơn {OrderCode}", payment.OrderCode);
            return new GatewayPaymentResult(
                Success: false,
                CheckoutUrl: null,
                QrCode: null,
                ErrorMessage: ex.Message
            );
        }
    }

    public async Task<(bool IsValid, GatewayWebhookResult? Result)> ProcessWebhookAsync(string requestBody, string? signature)
    {
        try
        {
            var webhook = JsonSerializer.Deserialize<Webhook>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (webhook == null)
            {
                return (false, null);
            }

            var verifiedData = await _client.Webhooks.VerifyAsync(webhook);

            var result = new GatewayWebhookResult(
                Success: true,
                OrderCode: verifiedData.OrderCode,
                Amount: verifiedData.Amount,
                TransactionRef: verifiedData.Reference,
                Status: "Success",
                RawPayload: requestBody
            );

            return (true, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Xác thực chữ ký webhook PayOS thất bại");
            return (false, new GatewayWebhookResult(
                Success: false,
                OrderCode: 0,
                Amount: 0,
                TransactionRef: null,
                Status: "Failed",
                RawPayload: requestBody,
                ErrorMessage: ex.Message
            ));
        }
    }
}
