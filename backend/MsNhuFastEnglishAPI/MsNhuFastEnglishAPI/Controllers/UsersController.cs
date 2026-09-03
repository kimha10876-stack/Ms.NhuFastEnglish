using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController(AppDbContext db) : ControllerBase
{
    // ── GET /api/users ────────────────────────────────────────────────────────
    // API hợp nhất tìm kiếm và lấy danh sách thành viên (Học viên & Giáo viên) cho Admin
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] UserFilterRequest req)
    {
        var query = db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.TeacherProfile)
            .Include(u => u.StudentProfile)
            .AsQueryable();

        // 1. Lọc theo Vai trò (Student | Teacher | Admin | All)
        if (!string.IsNullOrWhiteSpace(req.Role) && !req.Role.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var roleFilter = req.Role.Trim().ToLower();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name.ToLower() == roleFilter));
        }

        // 2. Tìm kiếm theo Họ tên, Email, hoặc Số điện thoại
        if (!string.IsNullOrWhiteSpace(req.Search))
        {
            var term = req.Search.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term) ||
                (u.TeacherProfile != null && u.TeacherProfile.Phone.Contains(term)) ||
                (u.StudentProfile != null && u.StudentProfile.Phone != null && u.StudentProfile.Phone.Contains(term))
            );
        }

        // 3. Lọc theo trạng thái hoạt động (Hoạt động / Đã khóa)
        if (req.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == req.IsActive.Value);
        }

        var totalCount = await query.CountAsync();
        var pageSize = req.PageSize > 0 ? req.PageSize : 10;
        var page = req.Page > 0 ? req.Page : 1;
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages < 1) totalPages = 1;

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

        // Lấy số lớp đang phụ trách (cho Giáo viên)
        var teachingCounts = await db.Classes
            .Where(c => userIds.Contains(c.TeacherId))
            .GroupBy(c => c.TeacherId)
            .Select(g => new { TeacherId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TeacherId, x => x.Count);

        // Lấy số lớp đang theo học (cho Học viên)
        var studentProfileIds = users.Where(u => u.StudentProfile != null).Select(u => u.StudentProfile!.Id).ToList();
        var enrolledCounts = await db.ClassMembers
            .Where(cm => studentProfileIds.Contains(cm.StudentId) && cm.Status == "active")
            .GroupBy(cm => cm.StudentId)
            .Select(g => new { StudentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.StudentId, x => x.Count);

        var items = users.Select(u =>
        {
            var roles = u.UserRoles.Select(ur => ur.Role.Name).ToList();
            var teachingCount = teachingCounts.GetValueOrDefault(u.Id, 0);
            var enrolledCount = u.StudentProfile != null ? enrolledCounts.GetValueOrDefault(u.StudentProfile.Id, 0) : 0;

            return new UserListItemDto(
                Id: u.Id,
                FullName: u.FullName,
                Email: u.Email,
                PhoneNumber: u.TeacherProfile?.Phone ?? u.StudentProfile?.Phone,
                AvatarUrl: u.AvatarUrl,
                Roles: roles,
                IsActive: u.IsActive,
                CreatedAt: u.CreatedAt,
                TeacherType: u.TeacherProfile?.Type,
                TeachingClassCount: teachingCount,
                StudentLevel: u.StudentProfile?.Level,
                StudentGoal: u.StudentProfile?.Goal,
                EnrolledClassCount: enrolledCount
            );
        }).ToList();

        var result = new PaginatedListDto<UserListItemDto>(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: totalPages
        );

        return Ok(ApiResponse.Ok(result));
    }
}
