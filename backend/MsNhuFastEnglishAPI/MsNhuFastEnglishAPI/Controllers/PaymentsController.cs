using System;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services.PaymentServices;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController(IPaymentService paymentService) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());

    private bool IsAdmin =>
        User.IsInRole("Admin");

    // ── POST /api/payments/create ─────────────────────────────────────────────
    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePaymentOrder([FromBody] CreatePaymentRequest req)
    {
        var (result, error) = await paymentService.CreatePaymentOrderAsync(UserId, req);
        if (error != null)
            return BadRequest(ApiResponse.BadRequest(error));

        return Ok(ApiResponse.Ok(result, "Tạo đơn thanh toán thành công"));
    }

    // ── GET /api/payments/{id} ────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetPaymentDetail(Guid id)
    {
        var (result, error) = await paymentService.GetPaymentByIdAsync(id, UserId, IsAdmin);
        if (error != null)
            return NotFound(ApiResponse.NotFound(error));

        return Ok(ApiResponse.Ok(result));
    }

    // ── GET /api/payments/{id}/status ─────────────────────────────────────────
    [HttpGet("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> GetPaymentStatus(Guid id)
    {
        var (result, error) = await paymentService.GetPaymentStatusAsync(id, UserId, IsAdmin);
        if (error != null)
            return NotFound(ApiResponse.NotFound(error));

        return Ok(ApiResponse.Ok(result));
    }

    // ── GET /api/payments/my-payments ─────────────────────────────────────────
    [HttpGet("my-payments")]
    [Authorize]
    public async Task<IActionResult> GetMyPayments([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await paymentService.GetMyPaymentsAsync(UserId, page, pageSize);
        return Ok(ApiResponse.Ok(result));
    }

    // ── POST /api/payments/{id}/cancel ────────────────────────────────────────
    [HttpPost("{id:guid}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelPayment(Guid id)
    {
        var (ok, error) = await paymentService.CancelPaymentAsync(id, UserId);
        if (!ok)
            return BadRequest(ApiResponse.BadRequest(error!));

        return Ok(ApiResponse.Ok<object?>(null, "Hủy đơn thanh toán thành công"));
    }

    // ── POST /api/payments/webhook/{gateway} ──────────────────────────────────
    [HttpPost("webhook/{gateway}")]
    [AllowAnonymous]
    public async Task<IActionResult> ReceiveWebhook(string gateway)
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var requestBody = await reader.ReadToEndAsync();

        // Lấy signature header nếu có (PayOS hoặc VNPay)
        var signature = Request.Headers["x-signature"].ToString();
        if (string.IsNullOrEmpty(signature))
        {
            signature = Request.Headers["secure-hash"].ToString();
        }

        var (ok, error) = await paymentService.ProcessWebhookAsync(gateway, requestBody, signature);
        if (!ok)
        {
            return BadRequest(new { message = error });
        }

        return Ok(new { success = true });
    }

    // ── GET /api/payments/admin/all ───────────────────────────────────────────
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminPayments([FromQuery] AdminPaymentFilterRequest filter)
    {
        var result = await paymentService.GetAdminPaymentsAsync(filter);
        return Ok(ApiResponse.Ok(result));
    }

    // ── POST /api/payments/admin/{id}/confirm-manual ──────────────────────────
    [HttpPost("admin/{id:guid}/confirm-manual")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ManualConfirmPayment(Guid id, [FromBody] ManualConfirmPaymentRequest req)
    {
        var (ok, error) = await paymentService.ManualConfirmPaymentAsync(id, UserId, req);
        if (!ok)
            return BadRequest(ApiResponse.BadRequest(error!));

        return Ok(ApiResponse.Ok<object?>(null, "Xác nhận thanh toán thủ công thành công"));
    }
}
