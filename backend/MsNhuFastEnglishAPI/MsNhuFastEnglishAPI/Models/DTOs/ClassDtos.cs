namespace MsNhuFastEnglishAPI.Models.DTOs;

// ── Requests ─────────────────────────────────────────────────────────────────

public record CreateClassRequest
{
    public required string   Name         { get; init; }
    public required int      CategoryId   { get; init; }
    public required Guid     TeacherId    { get; init; }
    public required DateOnly StartDate    { get; init; }
    public decimal   MonthlyFee   { get; init; } = 0;
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
    public decimal?  MonthlyFee    { get; init; }
    public string?   ScheduleDays  { get; init; }
    public string?   ScheduleTime  { get; init; }
    public string?   Room          { get; init; }
    public string?   Note          { get; init; }
    public int?      MaxStudents   { get; init; }
    public DateOnly? EndDate       { get; init; }
    public DateOnly? StartDate     { get; init; }
}

public record AddMemberRequest(Guid StudentId);
public record UpdateMemberTuitionRequest(string TuitionStatus);

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
    decimal  MonthlyFee,
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
    decimal  MonthlyFee,
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
    DateTime JoinedAt,
    string   TuitionStatus
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

public record PaginatedListDto<T>(
    IList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

// ── Session DTOs ─────────────────────────────────────────────────────────────
public record CreateSessionRequest(
    int SessionNumber,
    DateOnly SessionDate,
    string StartTime,
    string EndTime,
    string? Topic,
    string? Note,
    Guid? GuestTeacherId,
    string? GuestTeacherName = null
);

public record UpdateSessionRequest(
    int? SessionNumber,
    DateOnly? SessionDate,
    string? StartTime,
    string? EndTime,
    string? Topic,
    string? Note,
    Guid? GuestTeacherId,
    string? GuestTeacherName = null
);

public record ClassSessionDto(
    Guid Id,
    Guid ClassId,
    int SessionNumber,
    DateOnly SessionDate,
    string StartTime,
    string EndTime,
    string? Topic,
    string? Note,
    Guid? GuestTeacherId,
    string? GuestTeacherName,
    IList<ClassDocumentDto> Documents,
    string? AttendanceStatus = null
);

// ── Document DTOs ────────────────────────────────────────────────────────────
public record CreateDocumentRequest(
    Guid? SessionId,
    string Title,
    string FileUrl,
    string FileType,
    int FileSizeKb,
    System.Collections.Generic.List<Guid>? ShareClassIds = null
);

public record ClassDocumentDto(
    Guid Id,
    Guid ClassId,
    Guid? SessionId,
    string Title,
    string FileUrl,
    string FileType,
    int FileSizeKb,
    Guid UploadedBy,
    string UploadedByName,
    DateTime CreatedAt
);

// ── Assignment DTOs ──────────────────────────────────────────────────────────
public record CreateAssignmentRequest(
    string Title,
    string Description,
    DateTime? DueDate,
    string? AssignmentType = "Upload",
    bool? AllowLateSubmission = true,
    string? QuestionsJson = null
);

public record UpdateAssignmentRequest(
    string? Title,
    string? Description,
    DateTime? DueDate,
    string? AssignmentType = null,
    bool? AllowLateSubmission = null,
    string? QuestionsJson = null
);

public record ClassAssignmentDto(
    Guid Id,
    Guid ClassId,
    string Title,
    string Description,
    DateTime? DueDate,
    DateTime CreatedAt,
    string AssignmentType,
    bool AllowLateSubmission,
    string? QuestionsJson,
    AssignmentSubmissionDto? Submission,
    int SubmissionsCount
);

// ── Submission DTOs ──────────────────────────────────────────────────────────
public record SubmitAssignmentRequest(
    string? SubmissionText,
    string? FileUrl,
    string? FileName,
    string? AnswersJson = null
);

public record GradeSubmissionRequest(
    float Grade,
    string? TeacherFeedback,
    string? AnswersJson = null
);

public record AssignmentSubmissionDto(
    Guid Id,
    Guid AssignmentId,
    string? AssignmentTitle,
    Guid StudentId,
    string StudentName,
    string StudentEmail,
    string? SubmissionText,
    string? FileUrl,
    string? FileName,
    string? AnswersJson,
    DateTime SubmittedAt,
    float? Grade,
    string? TeacherFeedback
);

public record AssignmentQuestionDto(
    string Id,
    string Type,
    string QuestionText,
    string[]? Options,
    string? CorrectAnswer,
    float Points
);

public record StudentAnswerDto(
    string QuestionId,
    string? AnswerText,
    bool? IsCorrect,
    float? Grade,
    string? TeacherFeedback
);

public record CreateAnnouncementRequest(
    string Content
);

public record ClassAnnouncementDto(
    Guid Id,
    Guid ClassId,
    string Content,
    Guid CreatedBy,
    string CreatorName,
    string CreatorRole,
    DateTime CreatedAt,
    IList<AnnouncementCommentDto> Comments
);

public record CreateCommentRequest(
    string Content,
    Guid? ParentCommentId = null
);

public record AnnouncementCommentDto(
    Guid Id,
    Guid AnnouncementId,
    string Content,
    Guid CreatedBy,
    string CreatorName,
    string CreatorRole,
    DateTime CreatedAt,
    Guid? ParentCommentId
);

// ── Student Assignments DTO ──────────────────────────────────────────────────
public record StudentAssignmentItemDto(
    Guid AssignmentId,
    Guid ClassId,
    string ClassName,
    string CategoryName,
    string CategoryColorHex,
    string TeacherName,
    string Title,
    string Description,
    DateTime? DueDate,
    DateTime CreatedAt,
    string AssignmentType,
    bool AllowLateSubmission,
    bool IsSubmitted,
    DateTime? SubmittedAt,
    float? Grade,
    string? TeacherFeedback,
    bool IsOverdue
);

// ── Tuition DTOs ─────────────────────────────────────────────────────────────
public record TuitionPaymentDto(
    Guid Id,
    Guid ClassId,
    string ClassName,
    Guid StudentId,
    string StudentName,
    string StudentEmail,
    int Month,
    int Year,
    decimal Amount,
    string Status,
    string PaymentMethod,
    string? TransactionCode,
    DateTime PaidAt,
    Guid? ConfirmedBy,
    DateTime? ConfirmedAt,
    string? Note
);

public record PayTuitionRequest(
    int Month,
    int Year,
    decimal Amount,
    string PaymentMethod = "VietQR",
    string? TransactionCode = null,
    string? Note = null
);

public record ConfirmTuitionPaymentRequest(
    string Status = "paid", // "paid" | "rejected"
    string? Note = null
);

public record StudentMonthlyTuitionSummaryDto(
    Guid ClassId,
    string ClassName,
    string CategoryName,
    string CategoryColorHex,
    decimal MonthlyFee,
    int CurrentMonth,
    int CurrentYear,
    bool IsCurrentMonthPaid,
    DateTime? CurrentMonthPaidAt,
    string CurrentMonthPaymentStatus, // "paid" | "unpaid" | "pending"
    IList<TuitionPaymentDto> History
);

