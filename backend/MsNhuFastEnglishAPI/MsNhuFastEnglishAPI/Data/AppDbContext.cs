using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Models.Entities;

namespace MsNhuFastEnglishAPI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<TeacherProfile> TeacherProfiles => Set<TeacherProfile>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<ClassCategory> ClassCategories => Set<ClassCategory>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<ClassMember> ClassMembers => Set<ClassMember>();
    public DbSet<ClassSession> ClassSessions => Set<ClassSession>();
    public DbSet<ClassDocument> ClassDocuments => Set<ClassDocument>();
    public DbSet<ClassAssignment> ClassAssignments => Set<ClassAssignment>();
    public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
    public DbSet<ConsultationRequest> ConsultationRequests => Set<ConsultationRequest>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<CurriculumTemplate> CurriculumTemplates => Set<CurriculumTemplate>();
    public DbSet<CurriculumTemplateUnit> CurriculumTemplateUnits => Set<CurriculumTemplateUnit>();
    public DbSet<ClassAttendance> ClassAttendances => Set<ClassAttendance>();
    public DbSet<ClassAnnouncement> ClassAnnouncements => Set<ClassAnnouncement>();
    public DbSet<AnnouncementComment> AnnouncementComments => Set<AnnouncementComment>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // ── UserRole (composite PK) ──────────────────────────────────────
        mb.Entity<UserRole>(e =>
        {
            e.HasKey(ur => new { ur.UserId, ur.RoleId });
            e.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
            e.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
        });

        // ── User ─────────────────────────────────────────────────────────
        mb.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
            e.Property(u => u.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        // ── TeacherProfile ────────────────────────────────────────────────
        mb.Entity<TeacherProfile>(e =>
        {
            e.HasOne(tp => tp.User)
             .WithOne(u => u.TeacherProfile)
             .HasForeignKey<TeacherProfile>(tp => tp.UserId);
        });

        // ── StudentProfile ────────────────────────────────────────────────
        mb.Entity<StudentProfile>(e =>
        {
            e.HasOne(sp => sp.User)
             .WithOne(u => u.StudentProfile)
             .HasForeignKey<StudentProfile>(sp => sp.UserId);
        });

        // ── ClassCategory ─────────────────────────────────────────────────
        mb.Entity<ClassCategory>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
        });

        // ── Class ─────────────────────────────────────────────────────────
        mb.Entity<Class>(e =>
        {
            e.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
            e.HasOne(c => c.Teacher)
             .WithMany()
             .HasForeignKey(c => c.TeacherId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Category)
             .WithMany(cat => cat.Classes)
             .HasForeignKey(c => c.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ClassMember ───────────────────────────────────────────────────
        mb.Entity<ClassMember>(e =>
        {
            e.Property(cm => cm.JoinedAt).HasDefaultValueSql("NOW()");
            e.HasOne(cm => cm.Class)
             .WithMany(c => c.ClassMembers)
             .HasForeignKey(cm => cm.ClassId);
            e.HasOne(cm => cm.Student)
             .WithMany(s => s.ClassMembers)
             .HasForeignKey(cm => cm.StudentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ClassSession ──────────────────────────────────────────────────
        mb.Entity<ClassSession>(e =>
        {
            e.Property(cs => cs.CreatedAt).HasDefaultValueSql("NOW()");
            e.HasOne(cs => cs.Class)
             .WithMany(c => c.Sessions)
             .HasForeignKey(cs => cs.ClassId);
            e.HasOne(cs => cs.GuestTeacher)
             .WithMany()
             .HasForeignKey(cs => cs.GuestTeacherId)
             .OnDelete(DeleteBehavior.SetNull)
             .IsRequired(false);
        });

        // ── ClassDocument ─────────────────────────────────────────────────
        mb.Entity<ClassDocument>(e =>
        {
            e.Property(cd => cd.CreatedAt).HasDefaultValueSql("NOW()");
            e.HasOne(cd => cd.Class)
             .WithMany(c => c.Documents)
             .HasForeignKey(cd => cd.ClassId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(cd => cd.Session)
             .WithMany(s => s.Documents)
             .HasForeignKey(cd => cd.SessionId)
             .OnDelete(DeleteBehavior.SetNull)
             .IsRequired(false);
            e.HasOne(cd => cd.Uploader)
             .WithMany()
             .HasForeignKey(cd => cd.UploadedBy)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ClassAssignment ───────────────────────────────────────────────
        mb.Entity<ClassAssignment>(e =>
        {
            e.Property(ca => ca.CreatedAt).HasDefaultValueSql("NOW()");
            e.HasOne(ca => ca.Class)
             .WithMany(c => c.Assignments)
             .HasForeignKey(ca => ca.ClassId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── AssignmentSubmission ──────────────────────────────────────────
        mb.Entity<AssignmentSubmission>(e =>
        {
            e.Property(asb => asb.SubmittedAt).HasDefaultValueSql("NOW()");
            e.HasOne(asb => asb.Assignment)
             .WithMany(ca => ca.Submissions)
             .HasForeignKey(asb => asb.AssignmentId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(asb => asb.Student)
             .WithMany()
             .HasForeignKey(asb => asb.StudentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Seed Roles ────────────────────────────────────────────────────
        mb.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin",   Description = "Chủ trung tâm, toàn quyền" },
            new Role { Id = 2, Name = "Teacher", Description = "Giáo viên" },
            new Role { Id = 3, Name = "Student", Description = "Học viên" }
        );

        // ── Seed ClassCategories ──────────────────────────────────────────
        mb.Entity<ClassCategory>().HasData(
            new ClassCategory { Id = 1, Name = "Giao tiếp",    Slug = "giao-tiep",    ColorHex = "#007AFF", Icon = "message-circle", SortOrder = 1 },
            new ClassCategory { Id = 2, Name = "IELTS",         Slug = "ielts",         ColorHex = "#30D158", Icon = "award",           SortOrder = 2 },
            new ClassCategory { Id = 3, Name = "Thiếu nhi",    Slug = "thieu-nhi",    ColorHex = "#FF9500", Icon = "star",            SortOrder = 3 },
            new ClassCategory { Id = 4, Name = "Luyện thi",    Slug = "luyen-thi",    ColorHex = "#FF3B30", Icon = "clipboard-list",  SortOrder = 4 },
            new ClassCategory { Id = 5, Name = "Mất gốc",      Slug = "mat-goc",      ColorHex = "#AF52DE", Icon = "refresh-cw",      SortOrder = 5 },
            new ClassCategory { Id = 6, Name = "Doanh nghiệp", Slug = "doanh-nghiep", ColorHex = "#5856D6", Icon = "briefcase",       SortOrder = 6 }
        );

        // ── Seed SystemSettings ──────────────────────────────────────────
        mb.Entity<SystemSetting>().HasData(
            new SystemSetting { Key = "CenterName", Value = "Ms. Nhụ Fast English", Description = "Tên trung tâm" },
            new SystemSetting { Key = "Hotline", Value = "0905 123 456", Description = "Số điện thoại hotline" },
            new SystemSetting { Key = "Address", Value = "123 Đường Ba Tháng Hai, Đà Nẵng", Description = "Địa chỉ trung tâm" },
            new SystemSetting { Key = "FacebookUrl", Value = "https://facebook.com/msnhu.fastenglish", Description = "Liên kết trang Facebook" },
            new SystemSetting { Key = "Email", Value = "contact@msnhufastenglish.com", Description = "Email liên hệ" }
        );

        // ── BlogCategory ──────────────────────────────────────────────────
        mb.Entity<BlogCategory>(e =>
        {
            e.HasIndex(bc => bc.Slug).IsUnique();
        });

        // ── BlogPost ──────────────────────────────────────────────────────
        mb.Entity<BlogPost>(e =>
        {
            e.HasIndex(bp => bp.Slug).IsUnique();
            e.HasOne(bp => bp.Author)
             .WithMany()
             .HasForeignKey(bp => bp.AuthorId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(bp => bp.Category)
             .WithMany(bc => bc.BlogPosts)
             .HasForeignKey(bp => bp.CategoryId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── CurriculumTemplate ───────────────────────────────────────────
        mb.Entity<CurriculumTemplateUnit>(e =>
        {
            e.HasOne(ctu => ctu.Template)
             .WithMany(ct => ct.Units)
             .HasForeignKey(ctu => ctu.TemplateId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ClassAttendance ──────────────────────────────────────────────
        mb.Entity<ClassAttendance>(e =>
        {
            e.HasOne(ca => ca.Class)
             .WithMany()
             .HasForeignKey(ca => ca.ClassId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ca => ca.Session)
             .WithMany()
             .HasForeignKey(ca => ca.SessionId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ca => ca.Student)
             .WithMany()
             .HasForeignKey(ca => ca.StudentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ClassAnnouncement ─────────────────────────────────────────────
        mb.Entity<ClassAnnouncement>(e =>
        {
            e.Property(ca => ca.CreatedAt).HasDefaultValueSql("NOW()");
            e.HasOne(ca => ca.Class)
             .WithMany()
             .HasForeignKey(ca => ca.ClassId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ca => ca.Creator)
             .WithMany()
             .HasForeignKey(ca => ca.CreatedBy)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── AnnouncementComment ───────────────────────────────────────────
        mb.Entity<AnnouncementComment>(e =>
        {
            e.Property(ac => ac.CreatedAt).HasDefaultValueSql("NOW()");
            e.HasOne(ac => ac.Announcement)
             .WithMany(ca => ca.Comments)
             .HasForeignKey(ac => ac.AnnouncementId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ac => ac.Creator)
             .WithMany()
             .HasForeignKey(ac => ac.CreatedBy)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Seed BlogCategories ──────────────────────────────────────────
        mb.Entity<BlogCategory>().HasData(
            new BlogCategory { Id = 1, Name = "Tin tức", Slug = "tin-tuc", SortOrder = 1 },
            new BlogCategory { Id = 2, Name = "Kinh nghiệm học", Slug = "kinh-nghiem-hoc", SortOrder = 2 },
            new BlogCategory { Id = 3, Name = "Thông báo", Slug = "thong-bao", SortOrder = 3 }
        );
    }
}
