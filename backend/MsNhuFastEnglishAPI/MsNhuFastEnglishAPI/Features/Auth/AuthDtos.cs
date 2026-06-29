namespace MsNhuFastEnglishAPI.Features.Auth;

// ── Login ─────────────────────────────────────────────────────────────────────
public record LoginRequest(string Email, string Password);

// ── Register (Admin only) ─────────────────────────────────────────────────────
public record RegisterRequest
{
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
    string?  AvatarUrl
);

public record RegisterResponse(Guid Id, string Email, string FullName, string[] Roles);

// ── Forgot / Reset password (OTP) ────────────────────────────────────────────
public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest
{
    public required string Email       { get; init; }
    public required string Otp         { get; init; }
    public required string NewPassword { get; init; }
}
