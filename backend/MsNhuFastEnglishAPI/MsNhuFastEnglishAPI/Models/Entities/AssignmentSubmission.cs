using System;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class AssignmentSubmission
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; } // FK to StudentProfile
    public string? SubmissionText { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public DateTime SubmittedAt { get; set; }
    public float? Grade { get; set; }
    public string? TeacherFeedback { get; set; }

    public ClassAssignment Assignment { get; set; } = default!;
    public StudentProfile Student { get; set; } = default!;
}
