namespace MsNhuFastEnglishAPI.Domain.Entities;

public class StudentProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string Level { get; set; } = default!;
    public string Goal { get; set; } = default!;
    /// <summary>"active" | "paused" | "reserved" | "completed"</summary>
    public string Status { get; set; } = "active";
    public string? InternalNote { get; set; }

    public User User { get; set; } = default!;
    public ICollection<ClassMember> ClassMembers { get; set; } = new List<ClassMember>();
}
