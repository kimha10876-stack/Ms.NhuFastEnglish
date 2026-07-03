namespace MsNhuFastEnglishAPI.Models.DTOs;

// ── Requests ─────────────────────────────────────────────────────────────────

public record CreateClassRequest
{
    public required string   Name         { get; init; }
    public required int      CategoryId   { get; init; }
    public required Guid     TeacherId    { get; init; }
    public required DateOnly StartDate    { get; init; }
    public string?   ScheduleDays  { get; init; }
    public string?   ScheduleTime  { get; init; }
    public string?   Room          { get; init; }
    public string?   Note          { get; init; }
    public int?      MaxStudents   { get; init; }
    public DateOnly? EndDate       { get; init; }
}

public record UpdateClassRequest
{
    public string?   Name          { get; init; }
    public int?      CategoryId    { get; init; }
    public Guid?     TeacherId     { get; init; }
    public string?   Status        { get; init; }
    public string?   ScheduleDays  { get; init; }
    public string?   ScheduleTime  { get; init; }
    public string?   Room          { get; init; }
    public string?   Note          { get; init; }
    public int?      MaxStudents   { get; init; }
    public DateOnly? EndDate       { get; init; }
}

public record AddMemberRequest(Guid StudentId);

public record CreateInviteRequest(int ExpiryDays = 30);  // 0 = vĩnh viễn

// ── Student search ────────────────────────────────────────────────────────────

public record StudentSearchDto(
    Guid   StudentId,
    string FullName,
    string Email,
    string? AvatarUrl
);

// ── Teacher search ────────────────────────────────────────────────────────────

public record TeacherSearchDto(
    Guid   TeacherId,
    string FullName,
    string Email,
    string? AvatarUrl
);

// ── Responses ─────────────────────────────────────────────────────────────────

public record ClassSummaryDto(
    Guid     Id,
    string   Name,
    string   CategoryName,
    string   CategoryColorHex,
    string   TeacherName,
    string   Status,
    int      MemberCount,
    string?  ScheduleDays,
    string?  ScheduleTime,
    string?  Room,
    DateOnly StartDate,
    DateTime CreatedAt
);

public record ClassDetailDto(
    Guid     Id,
    string   Name,
    int      CategoryId,
    string   CategoryName,
    string   CategoryColorHex,
    Guid     TeacherId,
    string   TeacherName,
    string   Status,
    string?  ScheduleDays,
    string?  ScheduleTime,
    string?  Room,
    string?  Note,
    int?     MaxStudents,
    DateOnly StartDate,
    DateOnly? EndDate,
    DateTime CreatedAt,
    IList<ClassMemberDto> Members
);

public record ClassMemberDto(
    Guid     MemberId,
    Guid     StudentId,
    string   FullName,
    string   Email,
    string?  AvatarUrl,
    string   Status,
    DateTime JoinedAt
);

public record InviteInfoDto(
    Guid    ClassId,
    string  ClassName,
    string  TeacherName,
    string  CategoryName,
    string  CategoryColorHex,
    int     MemberCount,
    int?    MaxStudents
);

public record InviteLinkDto(
    string    Token,
    string    InviteUrl,
    DateTime? ExpiresAt
);

public record ClassCategoryDto(
    int Id,
    string Name,
    string ColorHex,
    string Icon
);
