using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record TeacherDetailDto(
    Guid TeacherId, // ID of TeacherProfile
    Guid UserId,    // ID of User
    string FullName,
    string Email,
    string Phone,
    string? Bio,
    string Type, // "permanent" | "guest"
    DateOnly ContractStart,
    DateOnly? ContractEnd,
    bool IsActive,
    DateTime CreatedAt,
    IList<TeacherClassDto> Classes
);

public record TeacherClassDto(
    Guid ClassId,
    string ClassName,
    string CategoryName,
    string CategoryColorHex,
    string Status,
    int MemberCount
);

public record CreateTeacherRequest(
    string FullName,
    string Email,
    string Password,
    string Phone,
    string? Bio,
    string Type, // "permanent" | "guest"
    DateOnly? ContractStart,
    DateOnly? ContractEnd
);

public record UpdateTeacherRequest(
    string? FullName,
    string? Email,
    string? Password,
    string? Phone,
    string? Bio,
    string? Type, // "permanent" | "guest"
    DateOnly? ContractStart,
    DateOnly? ContractEnd,
    bool? IsActive
);
