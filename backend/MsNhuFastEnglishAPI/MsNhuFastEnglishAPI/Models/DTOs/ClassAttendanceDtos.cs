using System;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record UpdateAttendanceRequest(
    Guid StudentId,
    string Status
);

public record StudentAttendanceDto(
    Guid StudentId,
    string FullName,
    string Email,
    string? Status
);
