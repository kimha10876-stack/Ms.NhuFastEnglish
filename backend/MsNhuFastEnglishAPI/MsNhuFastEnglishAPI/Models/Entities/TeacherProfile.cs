namespace MsNhuFastEnglishAPI.Models.Entities;

public class TeacherProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Phone { get; set; } = default!;
    public string? Bio { get; set; }
    /// <summary>"permanent" | "guest"</summary>
    public string Type { get; set; } = "permanent";
    public DateOnly ContractStart { get; set; }
    public DateOnly? ContractEnd { get; set; }

    public User User { get; set; } = default!;
}
