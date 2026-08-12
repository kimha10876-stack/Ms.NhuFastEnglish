namespace MsNhuFastEnglishAPI.Models.Entities;

public class Class
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public Guid TeacherId { get; set; }
    public int CategoryId { get; set; }
    /// <summary>"active" | "paused" | "ended"</summary>
    public string Status { get; set; } = "active";
    /// <summary>e.g. "T2,T4,T6"</summary>
    public string ScheduleDays { get; set; } = default!;
    /// <summary>e.g. "08:00-10:00"</summary>
    public string ScheduleTime { get; set; } = default!;
    public string? Room { get; set; }
    public string? Note { get; set; }
    public int? MaxStudents { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public decimal MonthlyFee { get; set; } = 0;
    public DateTime CreatedAt { get; set; }

    public User Teacher { get; set; } = default!;
    public ClassCategory Category { get; set; } = default!;
    public ICollection<ClassMember> ClassMembers { get; set; } = new List<ClassMember>();
    public ICollection<ClassSession> Sessions { get; set; } = new List<ClassSession>();
    public ICollection<ClassDocument> Documents { get; set; } = new List<ClassDocument>();
    public ICollection<ClassAssignment> Assignments { get; set; } = new List<ClassAssignment>();
    public ICollection<TuitionPayment> TuitionPayments { get; set; } = new List<TuitionPayment>();
}
