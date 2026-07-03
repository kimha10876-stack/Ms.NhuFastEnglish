namespace MsNhuFastEnglishAPI.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;

[ApiController]
[Route("api/students")]
[Authorize(Roles = "Admin")]
public class StudentsController(StudentService studentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStudents(
        [FromQuery] string search = "",
        [FromQuery] string status = "",
        [FromQuery] string level = "",
        [FromQuery] string goal = "",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await studentService.GetStudentsAsync(search, status, level, goal, page, pageSize);
        return Ok(ApiResponse.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetStudentDetail(Guid id)
    {
        var result = await studentService.GetStudentDetailAsync(id);
        if (result is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy học sinh"));
        return Ok(ApiResponse.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateStudent([FromBody] CreateStudentRequest req)
    {
        var (result, error) = await studentService.CreateStudentAsync(req);
        if (error is not null)
            return BadRequest(ApiResponse.BadRequest(error));
        return StatusCode(201, ApiResponse.Created(result!, "Tạo tài khoản học viên thành công"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateStudent(Guid id, [FromBody] UpdateStudentRequest req)
    {
        var (ok, error) = await studentService.UpdateStudentAsync(id, req);
        if (!ok) return BadRequest(ApiResponse.BadRequest(error!));
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật học viên thành công"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteStudent(Guid id)
    {
        var ok = await studentService.DeleteStudentAsync(id);
        if (!ok) return NotFound(ApiResponse.NotFound("Không tìm thấy học sinh"));
        return Ok(ApiResponse.Ok<object?>(null, "Khóa tài khoản học viên thành công"));
    }
}
