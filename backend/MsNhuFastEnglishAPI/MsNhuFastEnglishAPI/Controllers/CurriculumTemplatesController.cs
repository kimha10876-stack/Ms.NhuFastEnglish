using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/curriculum-templates")]
public class CurriculumTemplatesController(AppDbContext db) : ControllerBase
{
    // ── GET /api/curriculum-templates (Public / Authenticated) ──────────────────────
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await db.CurriculumTemplates
            .OrderBy(t => t.Name)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                t.CreatedAt,
                t.UpdatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse.Ok(templates, "Lấy danh sách khung chương trình thành công"));
    }

    // ── GET /api/curriculum-templates/{id} ───────────────────────────────────────
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetTemplateDetail(Guid id)
    {
        var template = await db.CurriculumTemplates
            .Include(t => t.Units)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null)
            return NotFound(ApiResponse.NotFound("Khung chương trình không tồn tại"));

        var unitDtos = template.Units
            .OrderBy(u => u.SessionNumber)
            .Select(u => new CurriculumTemplateUnitDto(
                u.Id,
                u.SessionNumber,
                u.Topic,
                u.Note,
                string.IsNullOrEmpty(u.DocumentsJson) 
                    ? new List<TemplateDocumentDto>() 
                    : JsonSerializer.Deserialize<List<TemplateDocumentDto>>(u.DocumentsJson) ?? new List<TemplateDocumentDto>()
            ))
            .ToList();

        var templateDocs = string.IsNullOrEmpty(template.DocumentsJson)
            ? new List<TemplateDocumentDto>()
            : JsonSerializer.Deserialize<List<TemplateDocumentDto>>(template.DocumentsJson) ?? new List<TemplateDocumentDto>();

        var result = new CurriculumTemplateDto(
            template.Id,
            template.Name,
            template.Description,
            templateDocs,
            template.CreatedAt,
            template.UpdatedAt,
            unitDtos
        );

        return Ok(ApiResponse.Ok(result, "Lấy chi tiết khung chương trình thành công"));
    }

    // ── POST /api/curriculum-templates (Admin Only) ─────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateCurriculumTemplateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(ApiResponse.BadRequest("Tên khung chương trình không được để trống"));

        var template = new CurriculumTemplate
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Description = req.Description?.Trim(),
            DocumentsJson = req.Documents != null ? JsonSerializer.Serialize(req.Documents) : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.CurriculumTemplates.Add(template);

        if (req.Units != null)
        {
            foreach (var u in req.Units)
            {
                var unit = new CurriculumTemplateUnit
                {
                    Id = Guid.NewGuid(),
                    TemplateId = template.Id,
                    SessionNumber = u.SessionNumber,
                    Topic = u.Topic?.Trim(),
                    Note = u.Note?.Trim(),
                    DocumentsJson = u.Documents != null ? JsonSerializer.Serialize(u.Documents) : null
                };
                db.CurriculumTemplateUnits.Add(unit);
            }
        }

        await db.SaveChangesAsync();

        return StatusCode(201, ApiResponse.Created(new { template.Id }, "Tạo khung chương trình thành công"));
    }

    // ── DELETE /api/curriculum-templates/{id} (Admin Only) ──────────────────────────
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        var template = await db.CurriculumTemplates.FindAsync(id);
        if (template == null)
            return NotFound(ApiResponse.NotFound("Khung chương trình không tồn tại"));

        db.CurriculumTemplates.Remove(template);
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Xóa khung chương trình thành công"));
    }
}
