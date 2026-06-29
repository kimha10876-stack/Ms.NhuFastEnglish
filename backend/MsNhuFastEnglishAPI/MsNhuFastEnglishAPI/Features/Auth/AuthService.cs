using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MsNhuFastEnglishAPI.Domain.Entities;
using MsNhuFastEnglishAPI.Features.Email;
using MsNhuFastEnglishAPI.Infrastructure.Persistence;
using StackExchange.Redis;

namespace MsNhuFastEnglishAPI.Features.Auth;

public class AuthService(
    AppDbContext db,
    IConnectionMultiplexer redis,
    IConfiguration config,
    EmailService email)
{
    private readonly IDatabase _cache = redis.GetDatabase();

    // ── Login ──────────────────────────────────────────────────────────────────
    public async Task<AuthResponse?> LoginAsync(LoginRequest req)
    {
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == req.Email.ToLower() && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        return await IssueTokensAsync(user);
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
    public async Task ForgotPasswordAsync(string emailAddress)
    {
        var user = await db.Users.FirstOrDefaultAsync(
            u => u.Email == emailAddress.ToLower() && u.IsActive);
        if (user is null) return;

        var otp = Random.Shared.Next(100_000, 1_000_000).ToString();
        await _cache.StringSetAsync(
            $"pwd_otp:{user.Email}", otp, TimeSpan.FromMinutes(15));

        _ = email.SendOtpAsync(user.Email, user.FullName, otp);
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
            User: new AuthUserDto(user.Id, user.Email, user.FullName, roles, user.AvatarUrl)
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
