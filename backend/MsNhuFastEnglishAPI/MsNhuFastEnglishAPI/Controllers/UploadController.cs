using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.BadRequest("Không nhận được file hoặc file rỗng"));

        try
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/api/uploads/{uniqueFileName}";
            return Ok(ApiResponse.Ok(new { fileUrl, fileName = file.FileName }));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ServerError($"Lỗi tải file: {ex.Message}"));
        }
    }
}
