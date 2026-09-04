using System;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class ClassAttendance
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Guid SessionId { get; set; }
    public Guid StudentId { get; set; }
    
    /// <summary>
    /// "present" | "absent"
    /// </summary>
    public string Status { get; set; } = "present";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Class Class { get; set; } = default!;
    public ClassSession Session { get; set; } = default!;
    public StudentProfile Student { get; set; } = default!;
}
