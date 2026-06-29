using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Domain.Entities;

namespace MsNhuFastEnglishAPI.Infrastructure.Persistence;

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
    public DbSet<ConsultationRequest> ConsultationRequests => Set<ConsultationRequest>();

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

        // ── ConsultationRequest ───────────────────────────────────────────
        mb.Entity<ConsultationRequest>(e =>
        {
            e.Property(cr => cr.CreatedAt).HasDefaultValueSql("NOW()");
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
    }
}
