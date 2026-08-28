using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/consultations")]
public class ConsultationController(ConsultationService consultationService) : ControllerBase
{
    // ── POST /api/consultations (Public) ──────────────────────────────────────
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateConsultation([FromBody] CreateConsultationRequest req)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.BadRequest("Dữ liệu đầu vào không hợp lệ"));
        }

        var result = await consultationService.CreateConsultationAsync(req);
        return StatusCode(201, ApiResponse.Created(result, "Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ sớm nhất."));
    }

    // ── GET /api/consultations (Admin Only) ───────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetConsultations(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await consultationService.GetConsultationsAsync(search, status, page, pageSize);
        return Ok(ApiResponse.Ok(result));
    }

    // ── GET /api/consultations/new-count (Admin Only) ─────────────────────────
    [HttpGet("new-count")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetNewCount()
    {
        var count = await consultationService.GetNewCountAsync();
        return Ok(ApiResponse.Ok(count));
    }

    // ── GET /api/consultations/export (Admin Only) ─────────────────────────────
    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportConsultations(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var stream = await consultationService.ExportToExcelAsync(search, status);
        var fileName = $"Danh_Sach_Tu_Van_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    // ── PUT /api/consultations/{id:guid} (Admin Only) ─────────────────────────
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateConsultationStatusRequest req)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.BadRequest("Dữ liệu cập nhật không hợp lệ"));
        }

        var result = await consultationService.UpdateStatusAsync(id, req);
        if (result == null)
        {
            return NotFound(ApiResponse.NotFound("Không tìm thấy yêu cầu tư vấn tương ứng"));
        }

        return Ok(ApiResponse.Ok(result, "Cập nhật trạng thái tư vấn thành công"));
    }

    // ── DELETE /api/consultations/{id:guid} (Admin Only) ──────────────────────
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteConsultation(Guid id)
    {
        var success = await consultationService.DeleteConsultationAsync(id);
        if (!success)
        {
            return NotFound(ApiResponse.NotFound("Không tìm thấy yêu cầu tư vấn để xoá"));
        }

        return Ok(ApiResponse.Ok<object?>(null, "Xoá yêu cầu tư vấn thành công"));
    }
}
