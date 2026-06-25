namespace MsNhu.Api.Domain.Entities;

public class StudentProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    /// <summary>"basic" | "cap1" | "cap2" | "cap3" | "pre-ielts" | "ielts" | "giao-tiep"</summary>
    public string Level { get; set; } = default!;
    /// <summary>"giao-tiep" | "ielts" | "thi-lop-10" | "thi-lop-12" | "mat-goc" | "nang-diem"</summary>
    public string Goal { get; set; } = default!;
    /// <summary>"active" | "paused" | "reserved" | "completed"</summary>
    public string Status { get; set; } = "active";
    public string? InternalNote { get; set; }

    public User User { get; set; } = default!;
    public ICollection<ClassMember> ClassMembers { get; set; } = new List<ClassMember>();
}
