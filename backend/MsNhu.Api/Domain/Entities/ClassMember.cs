namespace MsNhu.Api.Domain.Entities;

public class ClassMember
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Guid StudentId { get; set; }
    /// <summary>"active" | "paused"</summary>
    public string Status { get; set; } = "active";
    public DateTime JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }

    public Class Class { get; set; } = default!;
    public StudentProfile Student { get; set; } = default!;
}
