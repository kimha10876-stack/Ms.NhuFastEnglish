using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MsNhu.Api.Domain.Entities;
using MsNhu.Api.Features.Email;
using MsNhu.Api.Infrastructure.Persistence;
using StackExchange.Redis;

namespace MsNhu.Api.Features.Auth;

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

    // ── Register (Admin creates teacher / student accounts) ───────────────────
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
            if (string.IsNullOrEmpty(req.Level)) return (null, "Level bắt buộc cho học viên");
            if (string.IsNullOrEmpty(req.Goal))  return (null, "Goal bắt buộc cho học viên");

            db.StudentProfiles.Add(new StudentProfile
            {
                Id          = Guid.NewGuid(),
                UserId      = user.Id,
                Phone       = req.Phone,
                ParentPhone = req.ParentPhone,
                DateOfBirth = req.DateOfBirth,
                Level       = req.Level,
                Goal        = req.Goal,
                Status      = "active",
            });
        }

        await db.SaveChangesAsync();

        // Gửi credentials qua email (fire-and-forget, không block response)
        _ = email.SendWelcomeAsync(user.Email, user.FullName, req.Password);

        return (new RegisterResponse(user.Id, user.Email, user.FullName, [role.Name]), null);
    }

    // ── Forgot password ────────────────────────────────────────────────────────
    public async Task ForgotPasswordAsync(string emailAddress)
    {
        var user = await db.Users.FirstOrDefaultAsync(
            u => u.Email == emailAddress.ToLower() && u.IsActive);

        // Luôn trả về thành công dù email không tồn tại (tránh user enumeration)
        if (user is null) return;

        var token     = Guid.NewGuid().ToString("N");
        var appUrl    = config["AppUrl"] ?? "http://localhost:5173";
        var resetUrl  = $"{appUrl}/reset-password?token={token}";

        await _cache.StringSetAsync(
            $"pwd_reset:{token}",
            user.Id.ToString(),
            TimeSpan.FromMinutes(15)
        );

        _ = email.SendPasswordResetAsync(user.Email, user.FullName, resetUrl);
    }

    // ── Reset password ─────────────────────────────────────────────────────────
    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest req)
    {
        var userIdStr = await _cache.StringGetAsync($"pwd_reset:{req.Token}");
        if (userIdStr.IsNullOrEmpty || !Guid.TryParse(userIdStr, out var userId))
            return false;

        var user = await db.Users.FindAsync(userId);
        if (user is null || !user.IsActive) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.UpdatedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Xóa token đã dùng + logout toàn bộ sessions
        await _cache.KeyDeleteAsync($"pwd_reset:{req.Token}");
        await LogoutAsync(userId, refreshToken: null, allDevices: true);

        return true;
    }

    // ── Refresh ────────────────────────────────────────────────────────────────
    public async Task<AuthResponse?> RefreshAsync(string refreshToken)
    {
        if (!TryParseToken(refreshToken, out var userId, out var tokenId))
            return null;

        var key = RedisKey(userId, tokenId);
        if (!await _cache.KeyExistsAsync(key)) return null;

        // Rotate: delete old token before issuing new pair
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
        var roles       = user.UserRoles.Select(ur => ur.Role.Name).ToArray();
        var tokenId     = Guid.NewGuid().ToString("N");
        var expiryDays  = config.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);

        // Key pattern: refresh:{userId}:{tokenId}
        await _cache.StringSetAsync(
            RedisKey(user.Id, tokenId),
            "1",
            TimeSpan.FromDays(expiryDays)
        );

        return new AuthResponse(
            AccessToken:  GenerateJwt(user, roles),
            RefreshToken: $"{user.Id}:{tokenId}",  // client stores this, sends it back on /refresh
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
                signingCredentials: creds
            ));
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
