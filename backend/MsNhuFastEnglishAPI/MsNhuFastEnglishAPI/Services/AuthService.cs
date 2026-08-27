using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;
using StackExchange.Redis;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Services;

public class AuthService(
    AppDbContext db,
    IConnectionMultiplexer redis,
    IConfiguration config,
    EmailService email)
{
    private readonly IDatabase _cache = redis.GetDatabase();

    // ── Login ──────────────────────────────────────────────────────────────────
    public async Task<(AuthResponse? Result, string? Error)> LoginAsync(LoginRequest req)
    {
        var input = req.Email.Trim().ToLower();
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == input || u.Username == input);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return (null, "Email hoặc mật khẩu không đúng");

        if (!user.IsActive)
            return (null, "Tài khoản của bạn đã bị khóa");

        // Nếu người dùng chọn portal (Admin/Teacher/Student) thì phải thuộc role đó
        if (!string.IsNullOrEmpty(req.Role) &&
            !user.UserRoles.Any(ur => ur.Role.Name == req.Role))
            return (null, $"Tài khoản không có quyền truy cập khu vực {req.Role}");

        var response = await IssueTokensAsync(user);
        return (response, null);
    }

    // ── Register (Admin creates teacher / student) ────────────────────────────
    public async Task<(RegisterResponse? Result, string? Error)> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower()))
            return (null, "Email đã tồn tại");

        var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == req.Role);
        if (role is null) return (null, $"Role '{req.Role}' không hợp lệ");

        var user = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = req.FullName,
            Email        = req.Email.ToLower(),
            Username     = await UsernameHelper.GenerateUniqueUsernameAsync(db, req.FullName),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            IsActive     = true,
        };

        user.UserRoles.Add(new UserRole
        {
            UserId     = user.Id,
            RoleId     = role.Id,
            AssignedAt = DateTime.UtcNow,
        });

        db.Users.Add(user);

        if (req.Role == "Teacher")
        {
            if (string.IsNullOrEmpty(req.Phone))
                return (null, "Phone bắt buộc cho giáo viên");

            db.TeacherProfiles.Add(new TeacherProfile
            {
                Id            = Guid.NewGuid(),
                UserId        = user.Id,
                Phone         = req.Phone,
                Bio           = req.Bio,
                Type          = req.TeacherType ?? "permanent",
                ContractStart = req.ContractStart ?? DateOnly.FromDateTime(DateTime.UtcNow),
                ContractEnd   = req.ContractEnd,
            });
        }
        else if (req.Role == "Student")
        {
            db.StudentProfiles.Add(new StudentProfile
            {
                Id          = Guid.NewGuid(),
                UserId      = user.Id,
                Phone       = req.Phone,
                ParentPhone = req.ParentPhone,
                DateOfBirth = req.DateOfBirth,
                Level       = req.Level ?? string.Empty,
                Goal        = req.Goal  ?? string.Empty,
                Status      = "active",
            });
        }

        await db.SaveChangesAsync();
        _ = email.SendWelcomeAsync(user.Email, user.FullName, req.Password);

        return (new RegisterResponse(user.Id, user.Email, user.FullName, [role.Name]), null);
    }

    // ── Public: học sinh tự đăng ký ───────────────────────────────────────────
    public async Task<(AuthResponse? Result, string? Error)> RegisterStudentAsync(RegisterStudentRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower()))
            return (null, "Email đã được sử dụng");

        var role = await db.Roles.FirstAsync(r => r.Name == "Student");

        var user = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = req.FullName,
            Email        = req.Email.ToLower(),
            Username     = await UsernameHelper.GenerateUniqueUsernameAsync(db, req.FullName),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            IsActive     = true,
        };

        user.UserRoles.Add(new UserRole
        {
            UserId     = user.Id,
            RoleId     = role.Id,
            AssignedAt = DateTime.UtcNow,
        });

        db.Users.Add(user);

        db.StudentProfiles.Add(new StudentProfile
        {
            Id          = Guid.NewGuid(),
            UserId      = user.Id,
            Phone       = req.Phone,
            ParentPhone = req.ParentPhone,
            Level       = req.Level ?? string.Empty,
            Goal        = req.Goal  ?? string.Empty,
            Status      = "active",
        });

        await db.SaveChangesAsync();
        _ = email.SendWelcomeAsync(user.Email, user.FullName, req.Password);

        user.UserRoles.First().Role = role;
        return (await IssueTokensAsync(user), null);
    }

    // ── Forgot password — sinh OTP 6 số, lưu Redis 15 phút ───────────────────
    public async Task<(bool Ok, bool IsCooldown, string? Error)> ForgotPasswordAsync(string emailAddress)
    {
        var key = emailAddress.ToLower();

        var user = await db.Users.FirstOrDefaultAsync(
            u => u.Email == key && u.IsActive);
        if (user is null) return (false, false, "Email không tồn tại trong hệ thống");

        // Kiểm tra cooldown 60s
        if (await _cache.KeyExistsAsync($"pwd_otp_cd:{key}"))
            return (false, true, "Vui lòng đợi 60 giây trước khi gửi lại");

        // Dùng lại OTP cũ nếu còn hạn, ngược lại tạo mới
        var existing = await _cache.StringGetAsync($"pwd_otp:{key}");
        var otp = existing.HasValue
            ? existing.ToString()
            : Random.Shared.Next(100_000, 1_000_000).ToString();

        await _cache.StringSetAsync($"pwd_otp:{key}", otp, TimeSpan.FromMinutes(15));
        await _cache.StringSetAsync($"pwd_otp_cd:{key}", "1", TimeSpan.FromSeconds(60));

        _ = email.SendOtpAsync(user.Email, user.FullName, otp);
        return (true, false, null);
    }

    // ── Verify OTP — kiểm tra không xóa ──────────────────────────────────────
    public async Task<(bool Ok, string? Error)> VerifyOtpAsync(VerifyOtpRequest req)
    {
        var stored = await _cache.StringGetAsync($"pwd_otp:{req.Email.ToLower()}");
        if (stored.IsNullOrEmpty) return (false, "Mã OTP đã hết hạn, vui lòng gửi lại");
        if (stored != req.Otp)    return (false, "Mã OTP không đúng");
        return (true, null);
    }

    // ── Reset password — xác thực OTP rồi đổi mật khẩu ───────────────────────
    public async Task<(bool Ok, string? Error)> ResetPasswordAsync(ResetPasswordRequest req)
    {
        var emailKey  = req.Email.ToLower();
        var storedOtp = await _cache.StringGetAsync($"pwd_otp:{emailKey}");

        if (storedOtp.IsNullOrEmpty)
            return (false, "Mã OTP đã hết hạn, vui lòng yêu cầu lại");

        if (storedOtp != req.Otp)
            return (false, "Mã OTP không đúng");

        var user = await db.Users.FirstOrDefaultAsync(
            u => u.Email == emailKey && u.IsActive);
        if (user is null) return (false, "Tài khoản không tồn tại");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.MustChangePassword = false;
        user.UpdatedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync();

        await _cache.KeyDeleteAsync($"pwd_otp:{emailKey}");
        await LogoutAsync(user.Id, refreshToken: null, allDevices: true);
        return (true, null);
    }

    // ── Refresh ────────────────────────────────────────────────────────────────
    public async Task<AuthResponse?> RefreshAsync(string refreshToken)
    {
        if (!TryParseToken(refreshToken, out var userId, out var tokenId))
            return null;

        var key = RedisKey(userId, tokenId);
        if (!await _cache.KeyExistsAsync(key)) return null;

        await _cache.KeyDeleteAsync(key);

        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        return user is null ? null : await IssueTokensAsync(user);
    }

    // ── Logout ─────────────────────────────────────────────────────────────────
    public async Task LogoutAsync(Guid userId, string? refreshToken, bool allDevices)
    {
        if (allDevices)
        {
            var server = redis.GetServer(redis.GetEndPoints().First());
            var keys   = server.Keys(pattern: $"refresh:{userId}:*").ToArray();
            if (keys.Length > 0) await _cache.KeyDeleteAsync(keys);
        }
        else if (refreshToken is not null && TryParseToken(refreshToken, out _, out var tokenId))
        {
            await _cache.KeyDeleteAsync(RedisKey(userId, tokenId));
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    private async Task<AuthResponse> IssueTokensAsync(User user)
    {
        var roles      = user.UserRoles.Select(ur => ur.Role.Name).ToArray();
        var tokenId    = Guid.NewGuid().ToString("N");
        var expiryDays = config.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);

        await _cache.StringSetAsync(
            RedisKey(user.Id, tokenId), "1", TimeSpan.FromDays(expiryDays));

        return new AuthResponse(
            AccessToken:  GenerateJwt(user, roles),
            RefreshToken: $"{user.Id}:{tokenId}",
            User: new AuthUserDto(user.Id, user.Email, user.FullName, roles, user.AvatarUrl, user.MustChangePassword, user.Username)
        );
    }

    private string GenerateJwt(User user, string[] roles)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(
            config.GetValue<int>("Jwt:AccessTokenExpiryMinutes", 15));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("fullName",                    user.FullName),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        return new JwtSecurityTokenHandler().WriteToken(
            new JwtSecurityToken(
                issuer:             config["Jwt:Issuer"],
                audience:           config["Jwt:Audience"],
                claims:             claims,
                expires:            expiry,
                signingCredentials: creds));
    }

    public async Task<(AuthUserDto? Result, string? Error)> UpdateAvatarAsync(Guid userId, Microsoft.AspNetCore.Http.IFormFile file)
    {
        if (file == null || file.Length == 0)
            return (null, "Không nhận được file hoặc file rỗng");

        // Validate file size (max 2MB)
        if (file.Length > 2 * 1024 * 1024)
            return (null, "Kích thước ảnh đại diện không được vượt quá 2MB");

        // Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLower();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        if (!allowedExtensions.Contains(extension))
            return (null, "Chỉ chấp nhận các định dạng ảnh: .jpg, .jpeg, .png, .gif, .webp");

        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user is null) return (null, "Tài khoản không tồn tại");

        // Delete old avatar if it exists locally
        if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/api/uploads/"))
        {
            var oldFileName = Path.GetFileName(user.AvatarUrl);
            var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", oldFileName);
            if (System.IO.File.Exists(oldFilePath))
            {
                try
                {
                    System.IO.File.Delete(oldFilePath);
                }
                catch
                {
                    // Ignore deletion error
                }
            }
        }

        // Save new avatar
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.AvatarUrl = $"/api/uploads/{uniqueFileName}";
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToArray();
        var dto = new AuthUserDto(user.Id, user.Email, user.FullName, roles, user.AvatarUrl, user.MustChangePassword, user.Username);
        return (dto, null);
    }

    public async Task<(AuthUserDto? Result, string? Error)> UpdateProfileAsync(Guid userId, UpdateProfileRequest req)
    {
        var username = req.Username.Trim().ToLower();
        var fullName = req.FullName.Trim();
        var avatarUrl = req.AvatarUrl?.Trim();

        // Check if username contains invalid characters
        if (System.Text.RegularExpressions.Regex.IsMatch(username, @"[^a-zA-Z0-9_\.]"))
            return (null, "Username chỉ được chứa chữ cái, số, dấu gạch dưới và dấu chấm");

        // Check duplicate
        var duplicate = await db.Users.AnyAsync(u => u.Id != userId && u.Username == username);
        if (duplicate) return (null, "Username đã tồn tại");

        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user is null) return (null, "Tài khoản không tồn tại");

        // Delete old avatar if it was changed/removed via this edit profile request
        if (user.AvatarUrl != avatarUrl)
        {
            if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/api/uploads/"))
            {
                var oldFileName = Path.GetFileName(user.AvatarUrl);
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", oldFileName);
                if (System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch
                    {
                        // Ignore
                    }
                }
            }
        }

        user.FullName = fullName;
        user.Username = username;
        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToArray();
        var dto = new AuthUserDto(user.Id, user.Email, user.FullName, roles, user.AvatarUrl, user.MustChangePassword, user.Username);
        return (dto, null);
    }

    public async Task<(bool Ok, string? Error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (user is null) return (false, "Tài khoản không tồn tại");

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return (false, "Mật khẩu hiện tại không đúng");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.MustChangePassword = false;
        user.UpdatedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(AuthUserDto? Result, string? Error)> GetProfileAsync(Guid userId)
    {
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user is null) return (null, "Tài khoản không tồn tại hoặc đã bị khóa");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToArray();
        var dto = new AuthUserDto(user.Id, user.Email, user.FullName, roles, user.AvatarUrl, user.MustChangePassword, user.Username);
        return (dto, null);
    }

    private static bool TryParseToken(string token, out Guid userId, out string tokenId)
    {
        userId  = Guid.Empty;
        tokenId = string.Empty;
        var sep = token.IndexOf(':');
        if (sep < 0) return false;
        tokenId = token[(sep + 1)..];
        return Guid.TryParse(token[..sep], out userId) && tokenId.Length > 0;
    }

    private static string RedisKey(Guid userId, string tokenId) =>
        $"refresh:{userId}:{tokenId}";
}
