namespace MsNhuFastEnglishAPI.Models.Entities;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Username { get; set; }
    public string PasswordHash { get; set; } = default!;
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool MustChangePassword { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public TeacherProfile? TeacherProfile { get; set; }
    public StudentProfile? StudentProfile { get; set; }
}
