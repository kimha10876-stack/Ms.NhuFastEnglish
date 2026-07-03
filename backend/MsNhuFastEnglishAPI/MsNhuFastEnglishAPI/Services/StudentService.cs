namespace MsNhuFastEnglishAPI.Services;

using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;

public class StudentService(AppDbContext db)
{
    public async Task<PaginatedListDto<StudentDetailDto>> GetStudentsAsync(
        string search = "",
        string status = "",
        string level = "",
        string goal = "",
        int page = 1,
        int pageSize = 10)
    {
        var query = db.StudentProfiles
            .Include(s => s.User)
            .AsQueryable();

        // 1. Tìm kiếm tương đối theo Họ tên, Email hoặc Số điện thoại
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s => s.User.FullName.ToLower().Contains(term) ||
                                     s.User.Email.ToLower().Contains(term) ||
                                     (s.Phone != null && s.Phone.Contains(term)));
        }

        // 2. Lọc theo trạng thái hồ sơ học sinh
        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusLower = status.Trim().ToLower();
            query = query.Where(s => s.Status.ToLower() == statusLower);
        }

        // 3. Lọc theo cấp độ học tập
        if (!string.IsNullOrWhiteSpace(level))
        {
            var levelLower = level.Trim().ToLower();
            query = query.Where(s => s.Level.ToLower() == levelLower);
        }

        // 4. Lọc theo mục tiêu đầu ra
        if (!string.IsNullOrWhiteSpace(goal))
        {
            var goalLower = goal.Trim().ToLower();
            query = query.Where(s => s.Goal.ToLower() == goalLower);
        }

        // 5. Phân trang kết quả
        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(s => s.User.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<StudentDetailDto>();
        foreach (var s in items)
        {
            var classMembers = await db.ClassMembers
                .Include(m => m.Class)
                    .ThenInclude(c => c.Category)
                .Include(m => m.Class)
                    .ThenInclude(c => c.Teacher)
                .Where(m => m.StudentId == s.Id && m.Status == "active")
                .ToListAsync();

            var classes = classMembers.Select(m => new StudentClassDto(
                ClassId:          m.ClassId,
                ClassName:        m.Class.Name,
                CategoryName:     m.Class.Category.Name,
                CategoryColorHex: m.Class.Category.ColorHex,
                TeacherName:      m.Class.Teacher.FullName,
                Status:           m.Class.Status,
                JoinedAt:         m.JoinedAt
            )).ToList();

            dtos.Add(new StudentDetailDto(
                StudentId:  s.Id,
                FullName:   s.User.FullName,
                Email:      s.User.Email,
                Phone:      s.Phone,
                Level:      s.Level,
                Goal:       s.Goal,
                Status:     s.Status,
                IsActive:   s.User.IsActive,
                CreatedAt:  s.User.CreatedAt,
                Classes:    classes
            ));
        }

        return new PaginatedListDto<StudentDetailDto>(dtos, totalCount, page, pageSize, totalPages);
    }

    public async Task<StudentDetailDto?> GetStudentDetailAsync(Guid studentId)
    {
        var s = await db.StudentProfiles
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (s is null) return null;

        var classMembers = await db.ClassMembers
            .Include(m => m.Class)
                .ThenInclude(c => c.Category)
            .Include(m => m.Class)
                .ThenInclude(c => c.Teacher)
            .Where(m => m.StudentId == s.Id && m.Status == "active")
            .ToListAsync();

        var classes = classMembers.Select(m => new StudentClassDto(
            ClassId:          m.ClassId,
            ClassName:        m.Class.Name,
            CategoryName:     m.Class.Category.Name,
            CategoryColorHex: m.Class.Category.ColorHex,
            TeacherName:      m.Class.Teacher.FullName,
            Status:           m.Class.Status,
            JoinedAt:         m.JoinedAt
        )).ToList();

        return new StudentDetailDto(
            StudentId:  s.Id,
            FullName:   s.User.FullName,
            Email:      s.User.Email,
            Phone:      s.Phone,
            Level:      s.Level,
            Goal:       s.Goal,
            Status:     s.Status,
            IsActive:   s.User.IsActive,
            CreatedAt:  s.User.CreatedAt,
            Classes:    classes
        );
    }

    public async Task<(StudentDetailDto? Result, string? Error)> CreateStudentAsync(CreateStudentRequest req)
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
            PasswordHash       = BCrypt.Net.BCrypt.HashPassword(rawPassword),
            IsActive           = true,
            MustChangePassword = true,
            CreatedAt          = DateTime.UtcNow
        };
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = 3, AssignedAt = DateTime.UtcNow }); // Student role id = 3
        db.Users.Add(user);

        var student = new StudentProfile
        {
            Id     = Guid.NewGuid(),
            UserId = user.Id,
            Phone  = req.Phone?.Trim(),
            Level  = req.Level.Trim(),
            Goal   = req.Goal.Trim(),
            Status = req.Status.Trim()
        };
        db.StudentProfiles.Add(student);

        await db.SaveChangesAsync();

        return (new StudentDetailDto(
            StudentId:  student.Id,
            FullName:   user.FullName,
            Email:      user.Email,
            Phone:      student.Phone,
            Level:      student.Level,
            Goal:       student.Goal,
            Status:     student.Status,
            IsActive:   user.IsActive,
            CreatedAt:  user.CreatedAt,
            Classes:    new List<StudentClassDto>()
        ), null);
    }

    public async Task<(bool Ok, string? Error)> UpdateStudentAsync(Guid studentId, UpdateStudentRequest req)
    {
        var student = await db.StudentProfiles
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student is null) return (false, "Học sinh không tồn tại");

        var u = student.User;

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

        if (req.Phone is not null) student.Phone = req.Phone.Trim();
        if (req.Level is not null) student.Level = req.Level.Trim();
        if (req.Goal is not null)   student.Goal  = req.Goal.Trim();
        if (req.Status is not null) student.Status = req.Status.Trim();
        if (req.IsActive.HasValue)   u.IsActive    = req.IsActive.Value;

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteStudentAsync(Guid studentId)
    {
        var student = await db.StudentProfiles
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student is null) return false;

        // Khóa tài khoản và chuyển trạng thái inactive
        student.Status = "inactive";
        student.User.IsActive = false;

        // Rút học sinh ra khỏi toàn bộ lớp học đang tham gia
        var memberships = await db.ClassMembers
            .Where(m => m.StudentId == studentId && m.Status == "active")
            .ToListAsync();
        foreach (var m in memberships)
        {
            m.Status = "left";
            m.LeftAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return true;
    }
}
