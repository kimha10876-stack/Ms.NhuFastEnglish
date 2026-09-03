using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;
using StackExchange.Redis;

namespace MsNhuFastEnglishAPI.Services;

public class ClassService(AppDbContext db, IConnectionMultiplexer redis, IConfiguration config)
{
    private readonly IDatabase _cache = redis.GetDatabase();

    // ── List / Detail ─────────────────────────────────────────────────────────

    public async Task<PaginatedListDto<ClassSummaryDto>> GetAllAsync(
        Guid? teacherUserId,
        string search = "",
        int? categoryId = null,
        string status = "",
        int page = 1,
        int pageSize = 10)
    {
        var query = db.Classes
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .Include(c => c.ClassMembers)
            .AsQueryable();

        // 1. Lọc theo giáo viên phụ trách
        if (teacherUserId.HasValue)
            query = query.Where(c => c.TeacherId == teacherUserId.Value);

        // 2. Tìm kiếm theo từ khóa (tên lớp, phòng, ghi chú)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(term) ||
                                     (c.Room != null && c.Room.ToLower().Contains(term)) ||
                                     (c.Note != null && c.Note.ToLower().Contains(term)));
        }

        // 3. Lọc theo danh mục
        if (categoryId.HasValue)
        {
            query = query.Where(c => c.CategoryId == categoryId.Value);
        }

        // 4. Lọc theo trạng thái
        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusLower = status.Trim().ToLower();
            query = query.Where(c => c.Status.ToLower() == statusLower);
        }

        // 5. Tính toán phân trang
        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        var classes = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = classes.Select(c => new ClassSummaryDto(
            Id:               c.Id,
            Name:             c.Name,
            CategoryName:     c.Category.Name,
            CategoryColorHex: c.Category.ColorHex,
            TeacherName:      c.Teacher.FullName,
            Status:           c.Status,
            MonthlyFee:       c.MonthlyFee,
            MemberCount:      c.ClassMembers.Count(m => m.Status == "active"),
            ScheduleDays:     c.ScheduleDays,
            ScheduleTime:     c.ScheduleTime,
            Room:             c.Room,
            StartDate:        c.StartDate,
            CreatedAt:        c.CreatedAt
        )).ToList();

        return new PaginatedListDto<ClassSummaryDto>(dtos, totalCount, page, pageSize, totalPages);
    }

    public async Task<ClassDetailDto?> GetDetailAsync(Guid id)
    {
        var c = await db.Classes
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .Include(c => c.ClassMembers)
                .ThenInclude(m => m.Student)
                    .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (c is null) return null;

        var activeMembers = c.ClassMembers.Where(m => m.Status == "active").ToList();

        return new ClassDetailDto(
            Id:               c.Id,
            Name:             c.Name,
            CategoryId:       c.CategoryId,
            CategoryName:     c.Category.Name,
            CategoryColorHex: c.Category.ColorHex,
            TeacherId:        c.TeacherId,
            TeacherName:      c.Teacher.FullName,
            Status:           c.Status,
            MonthlyFee:       c.MonthlyFee,
            ScheduleDays:     c.ScheduleDays,
            ScheduleTime:     c.ScheduleTime,
            Room:             c.Room,
            Note:             c.Note,
            MaxStudents:      c.MaxStudents,
            StartDate:        c.StartDate,
            EndDate:          c.EndDate,
            CreatedAt:        c.CreatedAt,
            Members: activeMembers.Select(m => new ClassMemberDto(
                MemberId:  m.Id,
                StudentId: m.StudentId,
                FullName:  m.Student.User.FullName,
                Email:     m.Student.User.Email,
                AvatarUrl: m.Student.User.AvatarUrl,
                Status:    m.Status,
                JoinedAt:  m.JoinedAt
            )).ToList()
        );
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public async Task<(ClassSummaryDto? Result, string? Error)> CreateAsync(CreateClassRequest req)
    {
        var category = await db.ClassCategories.FindAsync(req.CategoryId);
        if (category is null) return (null, "Danh mục không tồn tại");

        var teacher = await db.Users.FindAsync(req.TeacherId);
        if (teacher is null) return (null, "Giáo viên không tồn tại");

        var c = new Class
        {
            Id           = Guid.NewGuid(),
            Name         = req.Name,
            TeacherId    = req.TeacherId,
            CategoryId   = req.CategoryId,
            Status       = "active",
            MonthlyFee   = req.MonthlyFee,
            ScheduleDays = req.ScheduleDays ?? "",
            ScheduleTime = req.ScheduleTime ?? "",
            Room         = req.Room,
            Note         = req.Note,
            MaxStudents  = req.MaxStudents,
            StartDate    = req.StartDate,
            EndDate      = req.EndDate,
        };

        db.Classes.Add(c);
        await db.SaveChangesAsync();

        return (new ClassSummaryDto(
            Id:               c.Id,
            Name:             c.Name,
            CategoryName:     category.Name,
            CategoryColorHex: category.ColorHex,
            TeacherName:      teacher.FullName,
            Status:           c.Status,
            MonthlyFee:       c.MonthlyFee,
            MemberCount:      0,
            ScheduleDays:     c.ScheduleDays,
            ScheduleTime:     c.ScheduleTime,
            Room:             c.Room,
            StartDate:        c.StartDate,
            CreatedAt:        c.CreatedAt
        ), null);
    }

    public async Task<(bool Ok, string? Error)> UpdateAsync(Guid id, UpdateClassRequest req)
    {
        var c = await db.Classes.FindAsync(id);
        if (c is null) return (false, "Lớp học không tồn tại");

        if (req.Name          is not null) c.Name         = req.Name;
        if (req.Status        is not null) c.Status       = req.Status;
        if (req.MonthlyFee.HasValue)       c.MonthlyFee   = req.MonthlyFee.Value;
        if (req.ScheduleDays  is not null) c.ScheduleDays = req.ScheduleDays;
        if (req.ScheduleTime  is not null) c.ScheduleTime = req.ScheduleTime;
        if (req.Room          is not null) c.Room         = req.Room;
        if (req.Note          is not null) c.Note         = req.Note;
        if (req.MaxStudents.HasValue)      c.MaxStudents  = req.MaxStudents;
        if (req.EndDate.HasValue)          c.EndDate      = req.EndDate;
        if (req.StartDate.HasValue)        c.StartDate    = req.StartDate.Value;
        if (req.TeacherId.HasValue)        c.TeacherId    = req.TeacherId.Value;
        if (req.CategoryId.HasValue)       c.CategoryId   = req.CategoryId.Value;

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var c = await db.Classes.FindAsync(id);
        if (c is null) return false;
        db.Classes.Remove(c);
        await db.SaveChangesAsync();
        return true;
    }

    // ── Members ───────────────────────────────────────────────────────────────

    public async Task<(bool Ok, string? Error)> AddMemberAsync(Guid classId, Guid studentId)
    {
        var c = await db.Classes.FindAsync(classId);
        if (c is null) return (false, "Lớp học không tồn tại");

        var student = await db.StudentProfiles.FindAsync(studentId);
        if (student is null) return (false, "Học sinh không tồn tại");

        var already = await db.ClassMembers
            .AnyAsync(m => m.ClassId == classId && m.StudentId == studentId && m.Status == "active");
        if (already) return (false, "Học sinh đã là thành viên của lớp này");

        if (c.MaxStudents.HasValue)
        {
            var count = await db.ClassMembers
                .CountAsync(m => m.ClassId == classId && m.Status == "active");
            if (count >= c.MaxStudents.Value)
                return (false, "Lớp học đã đầy");
        }

        db.ClassMembers.Add(new ClassMember
        {
            Id        = Guid.NewGuid(),
            ClassId   = classId,
            StudentId = studentId,
            Status    = "active",
            JoinedAt  = DateTime.UtcNow,
        });

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> RemoveMemberAsync(Guid classId, Guid memberId)
    {
        var member = await db.ClassMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.ClassId == classId);
        if (member is null) return false;

        member.Status = "left";
        member.LeftAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    // ── Student search (for AddMember dialog) ─────────────────────────────────

    public async Task<IList<StudentSearchDto>> SearchStudentsAsync(string q)
    {
        var term = q.Trim().ToLower();
        var results = await db.StudentProfiles
            .Include(s => s.User)
            .Where(s => s.User.FullName.ToLower().Contains(term) ||
                        s.User.Email.ToLower().Contains(term))
            .OrderBy(s => s.User.FullName)
            .Take(10)
            .ToListAsync();

        return results.Select(s => new StudentSearchDto(
            StudentId: s.Id,
            FullName:  s.User.FullName,
            Email:     s.User.Email,
            AvatarUrl: s.User.AvatarUrl
        )).ToList();
    }

    // ── Teacher search (for Create/Edit Class dropdown) ───────────────────────

    public async Task<IList<TeacherSearchDto>> SearchTeachersAsync(string q)
    {
        var term = q.Trim().ToLower();
        var query = db.TeacherProfiles
            .Include(t => t.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(term))
        {
            query = query.Where(t => t.User.FullName.ToLower().Contains(term) ||
                                     t.User.Email.ToLower().Contains(term));
        }

        var results = await query
            .OrderBy(t => t.User.FullName)
            .Take(20)
            .ToListAsync();

        return results.Select(t => new TeacherSearchDto(
            TeacherId: t.UserId,
            FullName:  t.User.FullName,
            Email:     t.User.Email,
            AvatarUrl: t.User.AvatarUrl
        )).ToList();
    }

    // ── Invite link ───────────────────────────────────────────────────────────

    public async Task<InviteLinkDto> CreateInviteAsync(Guid classId, int expiryDays)
    {
        // 1. Thu hồi token cũ nếu có
        var activeInviteKey = $"class_active_invite:{classId}";
        var oldToken = await _cache.StringGetAsync(activeInviteKey);
        if (!oldToken.IsNullOrEmpty)
        {
            await _cache.KeyDeleteAsync($"class_invite:{oldToken}");
        }

        // 2. Tạo token mới
        var token    = Guid.NewGuid().ToString("N")[..12];
        var redisKey = $"class_invite:{token}";
        var baseUrl  = config["AppUrl"] ?? config["Frontend:BaseUrl"] ?? "http://localhost:5173";

        if (expiryDays > 0)
        {
            var expiry = TimeSpan.FromDays(expiryDays);
            await _cache.StringSetAsync(redisKey, classId.ToString(), expiry);
            await _cache.StringSetAsync(activeInviteKey, token, expiry);
        }
        else
        {
            await _cache.StringSetAsync(redisKey, classId.ToString());
            await _cache.StringSetAsync(activeInviteKey, token);
        }

        DateTime? expiresAt = expiryDays > 0
            ? DateTime.UtcNow.AddDays(expiryDays)
            : null;

        return new InviteLinkDto(
            Token:     token,
            InviteUrl: $"{baseUrl}/tham-gia/{token}",
            ExpiresAt: expiresAt
        );
    }

    public async Task<InviteLinkDto?> GetActiveInviteAsync(Guid classId)
    {
        var activeInviteKey = $"class_active_invite:{classId}";
        var token = await _cache.StringGetAsync(activeInviteKey);
        if (token.IsNullOrEmpty) return null;

        var redisKey = $"class_invite:{token}";
        if (!await _cache.KeyExistsAsync(redisKey))
        {
            await _cache.KeyDeleteAsync(activeInviteKey);
            return null;
        }

        var baseUrl  = config["AppUrl"] ?? config["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var ttl = await _cache.KeyTimeToLiveAsync(redisKey);
        DateTime? expiresAt = ttl.HasValue ? DateTime.UtcNow.Add(ttl.Value) : null;

        return new InviteLinkDto(
            Token:     token.ToString(),
            InviteUrl: $"{baseUrl}/tham-gia/{token}",
            ExpiresAt: expiresAt
        );
    }

    public async Task<bool> RevokeInviteAsync(Guid classId)
    {
        var activeInviteKey = $"class_active_invite:{classId}";
        var token = await _cache.StringGetAsync(activeInviteKey);
        if (token.IsNullOrEmpty) return false;

        await _cache.KeyDeleteAsync($"class_invite:{token}");
        await _cache.KeyDeleteAsync(activeInviteKey);
        return true;
    }

    public async Task<InviteInfoDto?> GetInviteInfoAsync(string token)
    {
        var classIdStr = await _cache.StringGetAsync($"class_invite:{token}");
        if (classIdStr.IsNullOrEmpty || !Guid.TryParse(classIdStr, out var classId))
            return null;

        var c = await db.Classes
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (c is null) return null;

        var memberCount = await db.ClassMembers
            .CountAsync(m => m.ClassId == classId && m.Status == "active");

        return new InviteInfoDto(
            ClassId:          c.Id,
            ClassName:        c.Name,
            TeacherName:      c.Teacher.FullName,
            CategoryName:     c.Category.Name,
            CategoryColorHex: c.Category.ColorHex,
            MemberCount:      memberCount,
            MaxStudents:      c.MaxStudents
        );
    }

    public async Task<(bool Ok, string? Error)> JoinByInviteAsync(string token, Guid userId)
    {
        var classIdStr = await _cache.StringGetAsync($"class_invite:{token}");
        if (classIdStr.IsNullOrEmpty || !Guid.TryParse(classIdStr, out var classId))
            return (false, "Link mời không hợp lệ hoặc đã hết hạn");

        var student = await db.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId);
        if (student is null)
            return (false, "Tài khoản này không phải học sinh");

        return await AddMemberAsync(classId, student.Id);
    }

    public async Task<IList<ClassCategoryDto>> GetCategoriesAsync()
    {
        var categories = await db.ClassCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return categories.Select(c => new ClassCategoryDto(
            Id: c.Id,
            Name: c.Name,
            ColorHex: c.ColorHex,
            Icon: c.Icon
        )).ToList();
    }

    public async Task<List<MyClassDto>> GetMyClassesAsync(Guid userId)
    {
        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null)
        {
            profile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Level = "Mới bắt đầu",
                Goal = "Giao tiếp cơ bản",
                Status = "active"
            };
            db.StudentProfiles.Add(profile);
            await db.SaveChangesAsync();
        }

        var classMembers = await db.ClassMembers
            .Include(m => m.Class)
                .ThenInclude(c => c.Category)
            .Include(m => m.Class)
                .ThenInclude(c => c.Teacher)
            .Where(m => m.StudentId == profile.Id && m.Status == "active")
            .ToListAsync();

        return classMembers.Select(m => new MyClassDto(
            ClassId: m.ClassId,
            ClassName: m.Class.Name,
            CategoryName: m.Class.Category.Name,
            CategoryColorHex: m.Class.Category.ColorHex,
            TeacherName: m.Class.Teacher.FullName,
            Status: m.Class.Status,
            JoinedAt: m.JoinedAt,
            ScheduleDays: m.Class.ScheduleDays,
            ScheduleTime: m.Class.ScheduleTime,
            Room: m.Class.Room
        )).ToList();
    }
}
