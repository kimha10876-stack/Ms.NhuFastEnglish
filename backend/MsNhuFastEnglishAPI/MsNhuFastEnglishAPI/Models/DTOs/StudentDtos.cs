namespace MsNhuFastEnglishAPI.Models.DTOs;

public record StudentDetailDto(
    Guid StudentId,
    string FullName,
    string Email,
    string? Phone,
    string Level,
    string Goal,
    string Status,
    bool IsActive,
    DateTime CreatedAt,
    IList<StudentClassDto> Classes
);

public record StudentClassDto(
    Guid ClassId,
    string ClassName,
    string CategoryName,
    string CategoryColorHex,
    string TeacherName,
    string Status,
    DateTime JoinedAt
);

public record CreateStudentRequest(
    string FullName,
    string Email,
    string Password,
    string? Phone,
    string Level,
    string Goal,
    string Status
);

public record UpdateStudentRequest(
    string? FullName,
    string? Email,
    string? Password,
    string? Phone,
    string? Level,
    string? Goal,
    string? Status,
    bool? IsActive
);
