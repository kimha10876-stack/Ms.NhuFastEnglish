using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;

namespace MsNhuFastEnglishAPI.Services;

public class SettingsService(AppDbContext db)
{
    // ── System Settings ───────────────────────────────────────────────────────

    public async Task<IList<SystemSettingDto>> GetSettingsAsync()
    {
        var settings = await db.SystemSettings.OrderBy(s => s.Key).ToListAsync();
        return settings.Select(s => new SystemSettingDto(s.Key, s.Value, s.Description)).ToList();
    }

    public async Task<bool> SaveSettingsAsync(SaveSettingsRequest req)
    {
        foreach (var (key, value) in req.Settings)
        {
            var setting = await db.SystemSettings.FindAsync(key);
            if (setting is not null)
            {
                setting.Value = value;
            }
            else
            {
                db.SystemSettings.Add(new SystemSetting
                {
                    Key = key,
                    Value = value,
                    Description = ""
                });
            }
        }

        await db.SaveChangesAsync();
        return true;
    }

    // ── User Roles ────────────────────────────────────────────────────────────

    public async Task<IList<UserWithRolesDto>> GetUsersAsync()
    {
        var users = await db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.FullName)
            .ToListAsync();

        return users.Select(u => new UserWithRolesDto(
            Id: u.Id,
            FullName: u.FullName,
            Email: u.Email,
            IsActive: u.IsActive,
            Roles: u.UserRoles.Select(ur => ur.Role.Name).ToList()
        )).ToList();
    }

    public async Task<bool> UpdateUserRolesAsync(Guid userId, UpdateUserRolesRequest req)
    {
        var user = await db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return false;

        // Xoá các vai trò hiện tại
        db.UserRoles.RemoveRange(user.UserRoles);

        foreach (var roleName in req.Roles)
        {
            var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role is not null)
            {
                db.UserRoles.Add(new UserRole
                {
                    UserId = userId,
                    RoleId = role.Id,
                    AssignedAt = DateTime.UtcNow
                });

                // Tự động tạo hồ sơ mặc định tương ứng nếu chưa có
                if (roleName == "Teacher")
                {
                    var hasProfile = await db.TeacherProfiles.AnyAsync(tp => tp.UserId == userId);
                    if (!hasProfile)
                    {
                        db.TeacherProfiles.Add(new TeacherProfile
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Phone = "",
                            Type = "permanent",
                            ContractStart = DateOnly.FromDateTime(DateTime.UtcNow)
                        });
                    }
                }
                else if (roleName == "Student")
                {
                    var hasProfile = await db.StudentProfiles.AnyAsync(sp => sp.UserId == userId);
                    if (!hasProfile)
                    {
                        db.StudentProfiles.Add(new StudentProfile
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Phone = "",
                            Status = "active"
                        });
                    }
                }
            }
        }

        await db.SaveChangesAsync();
        return true;
    }

    // ── Class Category CRUD ───────────────────────────────────────────────────

    public async Task<(ClassCategoryDto? Result, string? Error)> CreateCategoryAsync(CreateCategoryRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return (null, "Tên danh mục không được để trống");

        var slug = req.Name.Trim().ToLower().Replace(" ", "-");
        if (await db.ClassCategories.AnyAsync(c => c.Slug == slug))
            return (null, "Danh mục này đã tồn tại");

        var category = new ClassCategory
        {
            Name = req.Name.Trim(),
            Slug = slug,
            ColorHex = req.ColorHex ?? "#007AFF",
            Icon = req.Icon ?? "book",
            SortOrder = req.SortOrder ?? 1,
            IsActive = true
        };

        db.ClassCategories.Add(category);
        await db.SaveChangesAsync();

        return (new ClassCategoryDto(category.Id, category.Name, category.ColorHex, category.Icon), null);
    }

    public async Task<(bool Ok, string? Error)> UpdateCategoryAsync(int id, UpdateCategoryRequest req)
    {
        var category = await db.ClassCategories.FindAsync(id);
        if (category is null) return (false, "Danh mục không tồn tại");

        if (req.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return (false, "Tên danh mục không được để trống");

            var slug = req.Name.Trim().ToLower().Replace(" ", "-");
            var duplicate = await db.ClassCategories.AnyAsync(c => c.Slug == slug && c.Id != id);
            if (duplicate) return (false, "Tên danh mục trùng với một danh mục khác");

            category.Name = req.Name.Trim();
            category.Slug = slug;
        }

        if (req.ColorHex is not null) category.ColorHex = req.ColorHex;
        if (req.Icon is not null) category.Icon = req.Icon;
        if (req.SortOrder.HasValue) category.SortOrder = req.SortOrder.Value;
        if (req.IsActive.HasValue) category.IsActive = req.IsActive.Value;

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Ok, string? Error)> DeleteCategoryAsync(int id)
    {
        var category = await db.ClassCategories.FindAsync(id);
        if (category is null) return (false, "Danh mục không tồn tại");

        // Kiểm tra xem có lớp học nào đang sử dụng danh mục này không
        var count = await db.Classes.CountAsync(c => c.CategoryId == id);
        if (count > 0)
        {
            // Chuyển sang ẩn thay vì xóa
            category.IsActive = false;
            await db.SaveChangesAsync();
            return (true, "Danh mục đang được sử dụng bởi các lớp học, hệ thống đã tự động chuyển sang trạng thái Ẩn");
        }

        db.ClassCategories.Remove(category);
        await db.SaveChangesAsync();
        return (true, null);
    }
}
