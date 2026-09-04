using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class ClassAssignment
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public DateTime? DueDate { get; set; }
    public string AssignmentType { get; set; } = "Upload";
    public bool AllowLateSubmission { get; set; } = true;
    public string? QuestionsJson { get; set; }
    public DateTime CreatedAt { get; set; }

    public Class Class { get; set; } = default!;
    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
}
