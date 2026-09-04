using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;

namespace MsNhuFastEnglishAPI.Services;

public class TeacherService(AppDbContext db)
{
    public async Task<PaginatedListDto<TeacherDetailDto>> GetTeachersAsync(
        string search = "",
        string type = "",
        bool? isActive = null,
        int page = 1,
        int pageSize = 10)
    {
        var query = db.TeacherProfiles
            .Include(t => t.User)
            .AsQueryable();

        // 1. Search by Name, Email, or Phone
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.User.FullName.ToLower().Contains(term) ||
                                     t.User.Email.ToLower().Contains(term) ||
                                     t.Phone.Contains(term));
        }

        // 2. Filter by Teacher Type ("permanent" | "guest")
        if (!string.IsNullOrWhiteSpace(type))
        {
            var typeLower = type.Trim().ToLower();
            query = query.Where(t => t.Type.ToLower() == typeLower);
        }

        // 3. Filter by Active Status
        if (isActive.HasValue)
        {
            query = query.Where(t => t.User.IsActive == isActive.Value);
        }

        // 4. Pagination
        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(t => t.User.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<TeacherDetailDto>();
        foreach (var t in items)
        {
            var classes = await db.Classes
                .Include(c => c.Category)
                .Include(c => c.ClassMembers)
                .Where(c => c.TeacherId == t.UserId)
                .Select(c => new TeacherClassDto(
                    c.Id,
                    c.Name,
                    c.Category.Name,
                    c.Category.ColorHex,
                    c.Status,
                    c.ClassMembers.Count(m => m.Status == "active")
                ))
                .ToListAsync();

            dtos.Add(new TeacherDetailDto(
                TeacherId:     t.Id,
                UserId:        t.UserId,
                FullName:      t.User.FullName,
                Email:         t.User.Email,
                Phone:         t.Phone,
                Bio:           t.Bio,
                Type:          t.Type,
                ContractStart: t.ContractStart,
                ContractEnd:   t.ContractEnd,
                IsActive:      t.User.IsActive,
                CreatedAt:     t.User.CreatedAt,
                Classes:       classes
            ));
        }

        return new PaginatedListDto<TeacherDetailDto>(dtos, totalCount, page, pageSize, totalPages);
    }

    public async Task<TeacherDetailDto?> GetTeacherDetailAsync(Guid teacherId)
    {
        var t = await db.TeacherProfiles
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        if (t is null) return null;

        var classes = await db.Classes
            .Include(c => c.Category)
            .Include(c => c.ClassMembers)
            .Where(c => c.TeacherId == t.UserId)
            .Select(c => new TeacherClassDto(
                c.Id,
                c.Name,
                c.Category.Name,
                c.Category.ColorHex,
                c.Status,
                c.ClassMembers.Count(m => m.Status == "active")
            ))
            .ToListAsync();

        return new TeacherDetailDto(
            TeacherId:     t.Id,
            UserId:        t.UserId,
            FullName:      t.User.FullName,
            Email:         t.User.Email,
            Phone:         t.Phone,
            Bio:           t.Bio,
            Type:          t.Type,
            ContractStart: t.ContractStart,
            ContractEnd:   t.ContractEnd,
            IsActive:      t.User.IsActive,
            CreatedAt:     t.User.CreatedAt,
            Classes:       classes
        );
    }

    public async Task<(TeacherDetailDto? Result, string? Error)> CreateTeacherAsync(CreateTeacherRequest req)
    {
        var email = req.Email.Trim().ToLower();
        if (await db.Users.AnyAsync(u => u.Email.ToLower() == email))
            return (null, "Email đã tồn tại trong hệ thống");

        var rawPassword = string.IsNullOrWhiteSpace(req.Password) ? "123456" : req.Password;
        var user = new User
        {
            Id                 = Guid.NewGuid(),
            FullName           = req.FullName.Trim(),
            Email              = email,
            Username           = await MsNhuFastEnglishAPI.Shared.UsernameHelper.GenerateUniqueUsernameAsync(db, req.FullName.Trim()),
            PasswordHash       = BCrypt.Net.BCrypt.HashPassword(rawPassword),
            IsActive           = true,
            MustChangePassword = true,
            CreatedAt          = DateTime.UtcNow
        };
        // Teacher role ID = 2
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = 2, AssignedAt = DateTime.UtcNow });
        db.Users.Add(user);

        var teacher = new TeacherProfile
        {
            Id            = Guid.NewGuid(),
            UserId        = user.Id,
            Phone         = req.Phone.Trim(),
            Bio           = req.Bio?.Trim(),
            Type          = req.Type.Trim().ToLower() == "guest" ? "guest" : "permanent",
            ContractStart = req.ContractStart ?? DateOnly.FromDateTime(DateTime.UtcNow),
            ContractEnd   = req.ContractEnd
        };
        db.TeacherProfiles.Add(teacher);

        await db.SaveChangesAsync();

        return (new TeacherDetailDto(
            TeacherId:     teacher.Id,
            UserId:        user.Id,
            FullName:      user.FullName,
            Email:         user.Email,
            Phone:         teacher.Phone,
            Bio:           teacher.Bio,
            Type:          teacher.Type,
            ContractStart: teacher.ContractStart,
            ContractEnd:   teacher.ContractEnd,
            IsActive:      user.IsActive,
            CreatedAt:     user.CreatedAt,
            Classes:       new List<TeacherClassDto>()
        ), null);
    }

    public async Task<(bool Ok, string? Error)> UpdateTeacherAsync(Guid teacherId, UpdateTeacherRequest req)
    {
        var teacher = await db.TeacherProfiles
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        if (teacher is null) return (false, "Giáo viên không tồn tại");

        var u = teacher.User;

        if (req.FullName is not null) u.FullName = req.FullName.Trim();
        if (req.Email is not null)
        {
            var email = req.Email.Trim().ToLower();
            if (email != u.Email.ToLower() && await db.Users.AnyAsync(usr => usr.Email.ToLower() == email))
                return (false, "Email đã được sử dụng bởi tài khoản khác");
            u.Email = email;
        }

        if (!string.IsNullOrWhiteSpace(req.Password))
        {
            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            u.MustChangePassword = true;
        }

        if (req.Phone is not null) teacher.Phone = req.Phone.Trim();
        if (req.Bio is not null)   teacher.Bio   = req.Bio.Trim();
        if (req.Type is not null)  teacher.Type  = req.Type.Trim().ToLower() == "guest" ? "guest" : "permanent";
        if (req.ContractStart.HasValue) teacher.ContractStart = req.ContractStart.Value;
        if (req.ContractEnd.HasValue)   teacher.ContractEnd   = req.ContractEnd;
        if (req.IsActive.HasValue) u.IsActive = req.IsActive.Value;

        u.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteTeacherAsync(Guid teacherId)
    {
        var teacher = await db.TeacherProfiles
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        if (teacher is null) return false;

        // Lock user account
        teacher.User.IsActive = false;
        teacher.User.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return true;
    }
}
