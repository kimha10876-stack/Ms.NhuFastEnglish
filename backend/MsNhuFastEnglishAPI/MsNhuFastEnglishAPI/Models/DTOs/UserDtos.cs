using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record UserListItemDto(
    Guid Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string? AvatarUrl,
    List<string> Roles,
    bool IsActive,
    DateTime CreatedAt,
    // Teacher specific info
    string? TeacherType,
    int TeachingClassCount,
    // Student specific info
    string? StudentLevel,
    string? StudentGoal,
    int EnrolledClassCount
);

public record UserFilterRequest(
    string Role = "", // "Student" | "Teacher" | "Admin" | "" (All)
    string Search = "",
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 10
);
