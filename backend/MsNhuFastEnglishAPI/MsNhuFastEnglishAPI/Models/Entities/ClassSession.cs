namespace MsNhuFastEnglishAPI.Models.Entities;

public class ClassSession
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    /// <summary>NULL = giáo viên chính dạy, có giá trị = guest dạy thay</summary>
    public Guid? GuestTeacherId { get; set; }
    public string? GuestTeacherName { get; set; }
    public int SessionNumber { get; set; }
    public DateOnly SessionDate { get; set; }
    public string StartTime { get; set; } = default!;
    public string EndTime { get; set; } = default!;
    public string? Topic { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }

    public Class Class { get; set; } = default!;
    public User? GuestTeacher { get; set; }
    public ICollection<ClassDocument> Documents { get; set; } = new List<ClassDocument>();
}
