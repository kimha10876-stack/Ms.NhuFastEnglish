using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Middleware;
using MsNhuFastEnglishAPI.Models.Entities;
using MsNhuFastEnglishAPI.Services;
using MsNhuFastEnglishAPI.Shared;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Redis ─────────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!));

// ── JWT Auth ──────────────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer           = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidateAudience         = true,
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:5173"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Rate limiting ─────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("register", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window      = TimeSpan.FromHours(1),
                QueueLimit  = 0,
            }));

    options.OnRejected = async (ctx, token) =>
    {
        ctx.HttpContext.Response.StatusCode  = 429;
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsJsonAsync(
            ApiResponse.TooManyRequests("Quá nhiều yêu cầu, vui lòng thử lại sau 1 giờ"), token);
    };
});

// ── Exception handler ─────────────────────────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── Features ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ClassService>();
builder.Services.AddScoped<SettingsService>();
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<TeacherService>();

// ── Controllers + Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MsNhu FastEnglish API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type        = SecuritySchemeType.Http,
        Scheme      = "bearer",
        BearerFormat = "JWT",
        Description = "Nhập JWT token"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

var app = builder.Build();

// ── Auto-create schema ────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db     = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

    for (var attempt = 1; attempt <= 10; attempt++)
    {
        try 
        { 
            db.Database.EnsureCreated(); 
            
            // Khởi tạo bảng SystemSettings nếu chưa tồn tại
            db.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS ""SystemSettings"" (
                    ""Key"" TEXT NOT NULL,
                    ""Value"" TEXT NOT NULL,
                    ""Description"" TEXT,
                    CONSTRAINT ""PK_SystemSettings"" PRIMARY KEY (""Key"")
                );
            ");

            // Migration: Thêm cột MustChangePassword vào bảng Users nếu chưa có
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    DO $$ 
                    BEGIN 
                        IF NOT EXISTS (
                            SELECT 1 
                            FROM information_schema.columns 
                            WHERE table_name = 'Users' AND column_name = 'MustChangePassword'
                        ) THEN
                            ALTER TABLE ""Users"" ADD COLUMN ""MustChangePassword"" BOOLEAN NOT NULL DEFAULT FALSE;
                        ELSIF EXISTS (
                            SELECT 1 
                            FROM information_schema.columns 
                            WHERE table_name = 'Users' 
                              AND column_name = 'MustChangePassword' 
                              AND data_type <> 'boolean'
                        ) THEN
                            ALTER TABLE ""Users"" DROP COLUMN ""MustChangePassword"";
                            ALTER TABLE ""Users"" ADD COLUMN ""MustChangePassword"" BOOLEAN NOT NULL DEFAULT FALSE;
                        END IF;
                    END $$;
                ");
            }
            else
            {
                try
                {
                    db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""MustChangePassword"" INTEGER NOT NULL DEFAULT 0;");
                }
                catch
                {
                    // Bỏ qua lỗi nếu cột đã tồn tại (SQLite)
                }
            }

            // Gieo dữ liệu SystemSettings mặc định nếu bảng trống
            if (!db.SystemSettings.Any())
            {
                db.SystemSettings.AddRange(
                    new SystemSetting { Key = "CenterName", Value = "Ms. Nhụ Fast English", Description = "Tên trung tâm" },
                    new SystemSetting { Key = "Hotline", Value = "0905 123 456", Description = "Số điện thoại hotline" },
                    new SystemSetting { Key = "Address", Value = "123 Đường Ba Tháng Hai, Đà Nẵng", Description = "Địa chỉ trung tâm" },
                    new SystemSetting { Key = "FacebookUrl", Value = "https://facebook.com/msnhu.fastenglish", Description = "Liên kết trang Facebook" },
                    new SystemSetting { Key = "Email", Value = "contact@msnhufastenglish.com", Description = "Email liên hệ" }
                );
                db.SaveChanges();
            }
            break; 
        }
        catch (Exception ex)
        {
            if (attempt == 10) throw;
            logger.LogWarning("DB chưa sẵn sàng (lần {Attempt}/10): {Msg}", attempt, ex.Message);
            Thread.Sleep(TimeSpan.FromSeconds(3));
        }
    }

    // Seed Admin — kimha10876@gmail.com
    if (!db.Users.Any(u => u.Email == "kimha10876@gmail.com"))
    {
        var admin = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = "Kim Hà",
            Email        = "kimha10876@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            IsActive     = true,
        };
        admin.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = 1, AssignedAt = DateTime.UtcNow });
        db.Users.Add(admin);
        db.SaveChanges();
    }

    // Seed Teacher — nampnhse173502@fpt.edu.vn
    if (!db.Users.Any(u => u.Email == "nampnhse173502@fpt.edu.vn"))
    {
        var teacher = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = "Nam Phan",
            Email        = "nampnhse173502@fpt.edu.vn",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            IsActive     = true,
        };
        teacher.UserRoles.Add(new UserRole { UserId = teacher.Id, RoleId = 2, AssignedAt = DateTime.UtcNow });
        db.Users.Add(teacher);
        db.TeacherProfiles.Add(new TeacherProfile
        {
            Id            = Guid.NewGuid(),
            UserId        = teacher.Id,
            Phone         = "",
            Type          = "permanent",
            ContractStart = DateOnly.FromDateTime(DateTime.UtcNow),
        });
        db.SaveChanges();
    }

    // Seed 30 Students: user1@gmail.com to user30@gmail.com
    var hasNewStudents = false;
    for (int i = 1; i <= 30; i++)
    {
        var email = $"user{i}@gmail.com";
        if (!db.Users.Any(u => u.Email == email))
        {
            var student = new User
            {
                Id           = Guid.NewGuid(),
                FullName     = $"Học viên {i}",
                Email        = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                IsActive     = true,
                CreatedAt    = DateTime.UtcNow
            };
            student.UserRoles.Add(new UserRole { UserId = student.Id, RoleId = 3, AssignedAt = DateTime.UtcNow });
            db.Users.Add(student);
            db.StudentProfiles.Add(new StudentProfile
            {
                Id          = Guid.NewGuid(),
                UserId      = student.Id,
                Phone       = $"09051234{i:D2}",
                Level       = "Mất gốc",
                Goal        = "Giao tiếp cơ bản",
                Status      = "active"
            });
            hasNewStudents = true;
        }
    }
    if (hasNewStudents)
    {
        db.SaveChanges();
    }

    // Seed Class Categories programmatically if empty
    if (!db.ClassCategories.Any())
    {
        db.ClassCategories.AddRange(
            new ClassCategory { Name = "Giao tiếp",    Slug = "giao-tiep",    ColorHex = "#FF9500", Icon = "message-circle",   SortOrder = 1, IsActive = true },
            new ClassCategory { Name = "IELTS",        Slug = "ielts",        ColorHex = "#007AFF", Icon = "award",            SortOrder = 2, IsActive = true },
            new ClassCategory { Name = "Thiếu nhi",    Slug = "thieu-nhi",    ColorHex = "#34C759", Icon = "star",             SortOrder = 3, IsActive = true },
            new ClassCategory { Name = "Luyện thi",    Slug = "luyen-thi",    ColorHex = "#FF3B30", Icon = "book-open",        SortOrder = 4, IsActive = true },
            new ClassCategory { Name = "Mất gốc",      Slug = "mat-goc",      ColorHex = "#AF52DE", Icon = "refresh-cw",      SortOrder = 5, IsActive = true },
            new ClassCategory { Name = "Doanh nghiệp", Slug = "doanh-nghiep", ColorHex = "#5856D6", Icon = "briefcase",       SortOrder = 6, IsActive = true }
        );
        db.SaveChanges();
    }

    var categories = db.ClassCategories.ToList();

    // Seed 20 Classes và gán 15 học viên xoay vòng vào từng lớp
    if (!db.Classes.Any())
    {
        var teacherUser = db.Users.FirstOrDefault(u => u.Email == "nampnhse173502@fpt.edu.vn");
        var students = db.StudentProfiles.ToList();
        
        if (teacherUser != null && students.Count >= 15 && categories.Any())
        {
            for (int i = 1; i <= 20; i++)
            {
                var category = categories[(i - 1) % categories.Count];
                
                var cls = new Class
                {
                    Id = Guid.NewGuid(),
                    Name = $"{category.Name} - Lớp {i}",
                    TeacherId = teacherUser.Id,
                    CategoryId = category.Id,
                    Status = "active",
                    ScheduleDays = i % 2 == 0 ? "T2,T4,T6" : "T3,T5,T7",
                    ScheduleTime = i % 3 == 0 ? "18:00-19:30" : i % 3 == 1 ? "19:30-21:00" : "15:00-16:30",
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    CreatedAt = DateTime.UtcNow,
                };
                db.Classes.Add(cls);

                // Add 15 unique students by rotation
                for (int j = 0; j < 15; j++)
                {
                    var studentIndex = (i + j) % students.Count;
                    var student = students[studentIndex];
                    
                    db.ClassMembers.Add(new ClassMember
                    {
                        Id = Guid.NewGuid(),
                        ClassId = cls.Id,
                        StudentId = student.Id,
                        JoinedAt = DateTime.UtcNow,
                        Status = "active"
                    });
                }
            }
            db.SaveChanges();
        }
    }
}

app.UseExceptionHandler();
app.UseRateLimiter();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
