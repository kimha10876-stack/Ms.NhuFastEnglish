namespace MsNhuFastEnglishAPI.Models.DTOs;

// ── Login ─────────────────────────────────────────────────────────────────────
public record LoginRequest(string Email, string Password, string? Role = null);

// ── Register (Admin only) ─────────────────────────────────────────────────────
public record RegisterRequest
{
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    public required string Email    { get; init; }
    public required string Password { get; init; }
    public required string FullName { get; init; }
    /// <summary>"Teacher" | "Student"</summary>
    public required string Role { get; init; }

    // Teacher-specific
    public string?   Phone         { get; init; }
    public string?   TeacherType   { get; init; }
    public DateOnly? ContractStart { get; init; }
    public DateOnly? ContractEnd   { get; init; }
    public string?   Bio           { get; init; }

    // Student-specific
    public string?   Level       { get; init; }
    public string?   Goal        { get; init; }
    public string?   ParentPhone { get; init; }
    public DateOnly? DateOfBirth { get; init; }
}

// ── Public student self-registration ─────────────────────────────────────────
public record RegisterStudentRequest
{
    public required string FullName { get; init; }
    
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    public required string Email    { get; init; }
    public required string Password { get; init; }
    public string? Phone       { get; init; }
    public string? ParentPhone { get; init; }
    public string? Level       { get; init; }
    public string? Goal        { get; init; }
}

// ── Refresh ───────────────────────────────────────────────────────────────────
public record RefreshRequest(string RefreshToken);

// ── Logout ────────────────────────────────────────────────────────────────────
public record LogoutRequest(string? RefreshToken = null, bool AllDevices = false);

// ── Responses ─────────────────────────────────────────────────────────────────
public record AuthResponse(string AccessToken, string RefreshToken, AuthUserDto User);

public record AuthUserDto(
    Guid     Id,
    string   Email,
    string   FullName,
    string[] Roles,
    string?  AvatarUrl,
    bool     MustChangePassword = false,
    string?  Username = null
);

public record RegisterResponse(Guid Id, string Email, string FullName, string[] Roles);

// ── Forgot / Reset password (OTP) ────────────────────────────────────────────
public record ForgotPasswordRequest(
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    string Email
);

public record VerifyOtpRequest(
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    string Email, 
    string Otp
);

public record ResetPasswordRequest
{
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    public required string Email       { get; init; }
    public required string Otp         { get; init; }
    public required string NewPassword { get; init; }
}

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record UpdateProfileRequest(
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Họ tên không được để trống")]
    string FullName,
    
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Username không được để trống")]
    string Username,
    
    string? AvatarUrl
);
