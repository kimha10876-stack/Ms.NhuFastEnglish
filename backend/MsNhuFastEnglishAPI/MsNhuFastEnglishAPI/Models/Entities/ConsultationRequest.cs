namespace MsNhuFastEnglishAPI.Models.Entities;

public class ConsultationRequest
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string? Email { get; set; }
    public string? Message { get; set; }
    /// <summary>"new" | "contacted" | "enrolled" | "rejected"</summary>
    public string Status { get; set; } = "new";
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ContactedAt { get; set; }
}
