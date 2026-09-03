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
using MsNhuFastEnglishAPI.Services.PaymentServices;
using MsNhuFastEnglishAPI.Shared;
using StackExchange.Redis;

// ── Load .env file if running locally ──────────────────────────────────────────
var searchPaths = new[]
{
    Path.Combine(Directory.GetCurrentDirectory(), ".env"),
    Path.Combine(Directory.GetCurrentDirectory(), "..", ".env"),
    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env"),
    Path.Combine(AppContext.BaseDirectory, ".env")
};
foreach (var p in searchPaths)
{
    if (File.Exists(p))
    {
        foreach (var line in File.ReadAllLines(p))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#')) continue;
            var parts = trimmed.Split('=', 2);
            if (parts.Length == 2 && string.IsNullOrEmpty(Environment.GetEnvironmentVariable(parts[0].Trim())))
            {
                Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
            }
        }
        break;
    }
}

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

        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                throw new UnauthorizedAccessException("Tài khoản chưa được xác thực hoặc token đã hết hạn");
            },
            OnForbidden = context =>
            {
                throw new AccessViolationException("Bạn không có quyền truy cập vào chức năng này");
            }
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
builder.Services.AddScoped<ConsultationService>();

// ── Payment Services ──────────────────────────────────────────────────────────
builder.Services.AddScoped<IPaymentGateway, PayOSGatewayService>();
builder.Services.AddScoped<PaymentGatewayFactory>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

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
            
            // Tự động thêm cột ParentCommentId nếu chưa có
            db.Database.ExecuteSqlRaw(@"
                ALTER TABLE ""AnnouncementComments"" ADD COLUMN IF NOT EXISTS ""ParentCommentId"" uuid NULL;
            ");
            
            // Tự động thêm cột GuestTeacherName vào bảng ClassSessions nếu chưa có
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    ALTER TABLE ""ClassSessions"" ADD COLUMN IF NOT EXISTS ""GuestTeacherName"" VARCHAR(255) NULL;
                ");
            }
            else
            {
                try
                {
                    db.Database.ExecuteSqlRaw(@"ALTER TABLE ""ClassSessions"" ADD COLUMN ""GuestTeacherName"" TEXT;");
                }
                catch { }
            }
            
            // Tự động thêm cột TuitionStatus nếu chưa có
            db.Database.ExecuteSqlRaw(@"
                ALTER TABLE ""ClassMembers"" ADD COLUMN IF NOT EXISTS ""TuitionStatus"" VARCHAR(50) NOT NULL DEFAULT 'unpaid';
            ");
            
            // Khởi tạo bảng SystemSettings nếu chưa tồn tại
            db.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS ""SystemSettings"" (
                    ""Key"" TEXT NOT NULL,
                    ""Value"" TEXT NOT NULL,
                    ""Description"" TEXT,
                    CONSTRAINT ""PK_SystemSettings"" PRIMARY KEY (""Key"")
                );
            ");

            // Khởi tạo bảng BlogCategories và BlogPosts nếu chưa tồn tại
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS ""BlogCategories"" (
                        ""Id"" SERIAL PRIMARY KEY,
                        ""Name"" VARCHAR(255) NOT NULL,
                        ""Slug"" VARCHAR(255) NOT NULL,
                        ""SortOrder"" INT NOT NULL DEFAULT 0
                    );

                    CREATE TABLE IF NOT EXISTS ""BlogPosts"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""Title"" VARCHAR(500) NOT NULL,
                        ""Slug"" VARCHAR(500) NOT NULL,
                        ""ThumbnailUrl"" VARCHAR(1000),
                        ""Summary"" TEXT NOT NULL,
                        ""Content"" TEXT NOT NULL,
                        ""IsPublished"" BOOLEAN NOT NULL DEFAULT FALSE,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                        ""UpdatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                        ""ViewCount"" INT NOT NULL DEFAULT 0,
                        ""AuthorId"" UUID NOT NULL REFERENCES ""Users""(""Id"") ON DELETE CASCADE,
                        ""CategoryId"" INTEGER REFERENCES ""BlogCategories""(""Id"") ON DELETE SET NULL
                    );

                    CREATE TABLE IF NOT EXISTS ""ClassAssignments"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""ClassId"" UUID NOT NULL REFERENCES ""Classes""(""Id"") ON DELETE CASCADE,
                        ""Title"" VARCHAR(255) NOT NULL,
                        ""Description"" TEXT NOT NULL,
                        ""DueDate"" TIMESTAMP WITHOUT TIME ZONE,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS ""AssignmentSubmissions"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""AssignmentId"" UUID NOT NULL REFERENCES ""ClassAssignments""(""Id"") ON DELETE CASCADE,
                        ""StudentId"" UUID NOT NULL REFERENCES ""StudentProfiles""(""Id"") ON DELETE CASCADE,
                        ""SubmissionText"" TEXT,
                        ""FileUrl"" VARCHAR(1000),
                        ""FileName"" VARCHAR(255),
                        ""SubmittedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                        ""Grade"" REAL,
                        ""TeacherFeedback"" TEXT
                    );

                    CREATE TABLE IF NOT EXISTS ""CurriculumTemplates"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""Name"" VARCHAR(255) NOT NULL,
                        ""Description"" TEXT,
                        ""DocumentsJson"" TEXT,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                        ""UpdatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS ""CurriculumTemplateUnits"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""TemplateId"" UUID NOT NULL REFERENCES ""CurriculumTemplates""(""Id"") ON DELETE CASCADE,
                        ""SessionNumber"" INT NOT NULL,
                        ""Topic"" VARCHAR(255),
                        ""Note"" TEXT,
                        ""DocumentsJson"" TEXT
                    );

                    CREATE TABLE IF NOT EXISTS ""ClassAttendances"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""ClassId"" UUID NOT NULL REFERENCES ""Classes""(""Id"") ON DELETE CASCADE,
                        ""SessionId"" UUID NOT NULL REFERENCES ""ClassSessions""(""Id"") ON DELETE CASCADE,
                        ""StudentId"" UUID NOT NULL REFERENCES ""StudentProfiles""(""Id"") ON DELETE CASCADE,
                        ""Status"" VARCHAR(50) NOT NULL DEFAULT 'present',
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                        ""UpdatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS ""ClassAnnouncements"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""ClassId"" UUID NOT NULL REFERENCES ""Classes""(""Id"") ON DELETE CASCADE,
                        ""Content"" TEXT NOT NULL,
                        ""CreatedBy"" UUID NOT NULL REFERENCES ""Users""(""Id"") ON DELETE CASCADE,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS ""AnnouncementComments"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""AnnouncementId"" UUID NOT NULL REFERENCES ""ClassAnnouncements""(""Id"") ON DELETE CASCADE,
                        ""Content"" TEXT NOT NULL,
                        ""CreatedBy"" UUID NOT NULL REFERENCES ""Users""(""Id"") ON DELETE CASCADE,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS ""ConsultationRequests"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""FullName"" VARCHAR(255) NOT NULL,
                        ""Phone"" VARCHAR(50) NOT NULL,
                        ""Email"" VARCHAR(255),
                        ""Message"" TEXT,
                        ""Status"" VARCHAR(50) NOT NULL DEFAULT 'new',
                        ""AdminNote"" TEXT,
                        ""RequestCount"" INT NOT NULL DEFAULT 1,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                        ""ContactedAt"" TIMESTAMP WITHOUT TIME ZONE
                    );
                ");
            }
            else
            {
                try
                {
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS BlogCategories (
                            Id INTEGER PRIMARY KEY AUTOINCREMENT,
                            Name TEXT NOT NULL,
                            Slug TEXT NOT NULL,
                            SortOrder INTEGER NOT NULL DEFAULT 0
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS BlogPosts (
                            Id TEXT PRIMARY KEY,
                            Title TEXT NOT NULL,
                            Slug TEXT NOT NULL,
                            ThumbnailUrl TEXT,
                            Summary TEXT NOT NULL,
                            Content TEXT NOT NULL,
                            IsPublished INTEGER NOT NULL DEFAULT 0,
                            CreatedAt TEXT NOT NULL,
                            UpdatedAt TEXT NOT NULL,
                            ViewCount INTEGER NOT NULL DEFAULT 0,
                            AuthorId TEXT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
                            CategoryId INTEGER REFERENCES BlogCategories(Id) ON DELETE SET NULL
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS ClassAssignments (
                            Id TEXT PRIMARY KEY,
                            ClassId TEXT NOT NULL REFERENCES Classes(Id) ON DELETE CASCADE,
                            Title TEXT NOT NULL,
                            Description TEXT NOT NULL,
                            DueDate TEXT,
                            CreatedAt TEXT NOT NULL
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS AssignmentSubmissions (
                            Id TEXT PRIMARY KEY,
                            AssignmentId TEXT NOT NULL REFERENCES ClassAssignments(Id) ON DELETE CASCADE,
                            StudentId TEXT NOT NULL REFERENCES StudentProfiles(Id) ON DELETE CASCADE,
                            SubmissionText TEXT,
                            FileUrl TEXT,
                            FileName TEXT,
                            SubmittedAt TEXT NOT NULL,
                            Grade REAL,
                            TeacherFeedback TEXT
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS CurriculumTemplates (
                            Id TEXT PRIMARY KEY,
                            Name TEXT NOT NULL,
                            Description TEXT,
                            DocumentsJson TEXT,
                            CreatedAt TEXT NOT NULL,
                            UpdatedAt TEXT NOT NULL
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS CurriculumTemplateUnits (
                            Id TEXT PRIMARY KEY,
                            TemplateId TEXT NOT NULL REFERENCES CurriculumTemplates(Id) ON DELETE CASCADE,
                            SessionNumber INTEGER NOT NULL,
                            Topic TEXT,
                            Note TEXT,
                            DocumentsJson TEXT
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS ClassAttendances (
                            Id TEXT PRIMARY KEY,
                            ClassId TEXT NOT NULL REFERENCES Classes(Id) ON DELETE CASCADE,
                            SessionId TEXT NOT NULL REFERENCES ClassSessions(Id) ON DELETE CASCADE,
                            StudentId TEXT NOT NULL REFERENCES StudentProfiles(Id) ON DELETE CASCADE,
                            Status TEXT NOT NULL DEFAULT 'present',
                            CreatedAt TEXT NOT NULL,
                            UpdatedAt TEXT NOT NULL
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS ClassAnnouncements (
                            Id TEXT PRIMARY KEY,
                            ClassId TEXT NOT NULL REFERENCES Classes(Id) ON DELETE CASCADE,
                            Content TEXT NOT NULL,
                            CreatedBy TEXT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
                            CreatedAt TEXT NOT NULL
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS AnnouncementComments (
                            Id TEXT PRIMARY KEY,
                            AnnouncementId TEXT NOT NULL REFERENCES ClassAnnouncements(Id) ON DELETE CASCADE,
                            Content TEXT NOT NULL,
                            CreatedBy TEXT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
                            CreatedAt TEXT NOT NULL
                        );
                    ");
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS ConsultationRequests (
                            Id TEXT PRIMARY KEY,
                            FullName TEXT NOT NULL,
                            Phone TEXT NOT NULL,
                            Email TEXT,
                            Message TEXT,
                            Status TEXT NOT NULL DEFAULT 'new',
                            AdminNote TEXT,
                            RequestCount INTEGER NOT NULL DEFAULT 1,
                            CreatedAt TEXT NOT NULL,
                            ContactedAt TEXT
                        );
                    ");
                }
                catch { }
            }

            // Migration: Thêm cột DocumentsJson vào bảng CurriculumTemplates nếu chưa có
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    DO $$ 
                    BEGIN 
                        IF NOT EXISTS (
                            SELECT 1 
                            FROM information_schema.columns 
                            WHERE table_name = 'CurriculumTemplates' AND column_name = 'DocumentsJson'
                        ) THEN
                            ALTER TABLE ""CurriculumTemplates"" ADD COLUMN ""DocumentsJson"" TEXT;
                        END IF;
                    END $$;
                ");
            }
            else
            {
                try
                {
                    db.Database.ExecuteSqlRaw(@"ALTER TABLE CurriculumTemplates ADD COLUMN DocumentsJson TEXT;");
                }
                catch { }
            }

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

            // Migration: Thêm cột Username vào bảng Users nếu chưa có
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Username"" VARCHAR(255);
                    CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Users_Username"" ON ""Users"" (""Username"");
                ");
            }
            else
            {
                try
                {
                    db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""Username"" TEXT;");
                    db.Database.ExecuteSqlRaw(@"CREATE UNIQUE INDEX IF NOT EXISTS IX_Users_Username ON Users (Username);");
                }
                catch { }
            }

            // Populate empty usernames for existing users
            var usersWithoutUsername = db.Users.Where(u => u.Username == null || u.Username == "").ToList();
            if (usersWithoutUsername.Any())
            {
                foreach (var u in usersWithoutUsername)
                {
                    u.Username = UsernameHelper.GenerateUniqueUsernameAsync(db, u.FullName).GetAwaiter().GetResult();
                }
                db.SaveChanges();
            }

            // Migration: Thêm các cột mới cho Assignment, Submission, MonthlyFee và TuitionPayments nếu chưa có
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    ALTER TABLE ""ClassAssignments"" ADD COLUMN IF NOT EXISTS ""AssignmentType"" VARCHAR(50) NOT NULL DEFAULT 'Upload';
                    ALTER TABLE ""ClassAssignments"" ADD COLUMN IF NOT EXISTS ""AllowLateSubmission"" BOOLEAN NOT NULL DEFAULT TRUE;
                    ALTER TABLE ""ClassAssignments"" ADD COLUMN IF NOT EXISTS ""QuestionsJson"" TEXT;
                    ALTER TABLE ""AssignmentSubmissions"" ADD COLUMN IF NOT EXISTS ""AnswersJson"" TEXT;
                    ALTER TABLE ""Classes"" ADD COLUMN IF NOT EXISTS ""MonthlyFee"" NUMERIC(18,2) NOT NULL DEFAULT 0;
                    ALTER TABLE ""ConsultationRequests"" ADD COLUMN IF NOT EXISTS ""RequestCount"" INT NOT NULL DEFAULT 1;

                    CREATE TABLE IF NOT EXISTS ""Payments"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""OrderCode"" BIGINT NOT NULL,
                        ""PaymentCode"" VARCHAR(100) NOT NULL,
                        ""UserId"" UUID NOT NULL REFERENCES ""Users""(""Id"") ON DELETE RESTRICT,
                        ""StudentProfileId"" UUID REFERENCES ""StudentProfiles""(""Id"") ON DELETE SET NULL,
                        ""ClassId"" UUID REFERENCES ""Classes""(""Id"") ON DELETE SET NULL,
                        ""Amount"" NUMERIC(18,2) NOT NULL DEFAULT 0,
                        ""DiscountAmount"" NUMERIC(18,2) NOT NULL DEFAULT 0,
                        ""FinalAmount"" NUMERIC(18,2) NOT NULL DEFAULT 0,
                        ""Currency"" VARCHAR(10) NOT NULL DEFAULT 'VND',
                        ""PaymentType"" VARCHAR(50) NOT NULL DEFAULT 'TuitionMonthly',
                        ""Status"" VARCHAR(50) NOT NULL DEFAULT 'Pending',
                        ""PaymentMethod"" VARCHAR(50) NOT NULL DEFAULT 'PayOS',
                        ""BillingMonth"" INT,
                        ""BillingYear"" INT,
                        ""Description"" TEXT NOT NULL DEFAULT '',
                        ""CheckoutUrl"" TEXT,
                        ""QrCode"" TEXT,
                        ""ExpiresAt"" TIMESTAMP WITH TIME ZONE,
                        ""CompletedAt"" TIMESTAMP WITH TIME ZONE,
                        ""ConfirmedBy"" UUID,
                        ""Note"" TEXT,
                        ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                        ""UpdatedAt"" TIMESTAMP WITH TIME ZONE
                    );

                    CREATE TABLE IF NOT EXISTS ""PaymentTransactions"" (
                        ""Id"" UUID PRIMARY KEY,
                        ""PaymentId"" UUID NOT NULL REFERENCES ""Payments""(""Id"") ON DELETE CASCADE,
                        ""TransactionReference"" VARCHAR(255),
                        ""Gateway"" VARCHAR(50) NOT NULL,
                        ""Amount"" NUMERIC(18,2) NOT NULL DEFAULT 0,
                        ""Status"" VARCHAR(50) NOT NULL DEFAULT 'Pending',
                        ""GatewayResponse"" TEXT,
                        ""Note"" TEXT,
                        ""PaidAt"" TIMESTAMP WITH TIME ZONE,
                        ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                    );

                    CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Payments_OrderCode"" ON ""Payments""(""OrderCode"");
                    CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Payments_PaymentCode"" ON ""Payments""(""PaymentCode"");
                    CREATE INDEX IF NOT EXISTS ""IX_Payments_Status"" ON ""Payments""(""Status"");
                    CREATE INDEX IF NOT EXISTS ""IX_PaymentTransactions_TransactionReference"" ON ""PaymentTransactions""(""TransactionReference"");
                ");
            }
            else
            {
                try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""ClassAssignments"" ADD COLUMN ""AssignmentType"" TEXT NOT NULL DEFAULT 'Upload';"); } catch {}
                try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""ClassAssignments"" ADD COLUMN ""AllowLateSubmission"" INTEGER NOT NULL DEFAULT 1;"); } catch {}
                try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""ClassAssignments"" ADD COLUMN ""QuestionsJson"" TEXT;"); } catch {}
                try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""AssignmentSubmissions"" ADD COLUMN ""AnswersJson"" TEXT;"); } catch {}
                try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Classes"" ADD COLUMN ""MonthlyFee"" NUMERIC NOT NULL DEFAULT 0;"); } catch {}
                try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""ConsultationRequests"" ADD COLUMN ""RequestCount"" INTEGER NOT NULL DEFAULT 1;"); } catch {}
                try {
                    db.Database.ExecuteSqlRaw(@"
                        CREATE TABLE IF NOT EXISTS ""Payments"" (
                            ""Id"" TEXT PRIMARY KEY,
                            ""OrderCode"" INTEGER NOT NULL UNIQUE,
                            ""PaymentCode"" TEXT NOT NULL UNIQUE,
                            ""UserId"" TEXT NOT NULL,
                            ""StudentProfileId"" TEXT,
                            ""ClassId"" TEXT,
                            ""Amount"" NUMERIC NOT NULL DEFAULT 0,
                            ""DiscountAmount"" NUMERIC NOT NULL DEFAULT 0,
                            ""FinalAmount"" NUMERIC NOT NULL DEFAULT 0,
                            ""Currency"" TEXT NOT NULL DEFAULT 'VND',
                            ""PaymentType"" TEXT NOT NULL DEFAULT 'TuitionMonthly',
                            ""Status"" TEXT NOT NULL DEFAULT 'Pending',
                            ""PaymentMethod"" TEXT NOT NULL DEFAULT 'PayOS',
                            ""BillingMonth"" INTEGER,
                            ""BillingYear"" INTEGER,
                            ""Description"" TEXT NOT NULL DEFAULT '',
                            ""CheckoutUrl"" TEXT,
                            ""QrCode"" TEXT,
                            ""ExpiresAt"" TEXT,
                            ""CompletedAt"" TEXT,
                            ""ConfirmedBy"" TEXT,
                            ""Note"" TEXT,
                            ""CreatedAt"" TEXT NOT NULL DEFAULT (datetime('now')),
                            ""UpdatedAt"" TEXT
                        );
                        CREATE TABLE IF NOT EXISTS ""PaymentTransactions"" (
                            ""Id"" TEXT PRIMARY KEY,
                            ""PaymentId"" TEXT NOT NULL,
                            ""TransactionReference"" TEXT,
                            ""Gateway"" TEXT NOT NULL,
                            ""Amount"" NUMERIC NOT NULL DEFAULT 0,
                            ""Status"" TEXT NOT NULL DEFAULT 'Pending',
                            ""GatewayResponse"" TEXT,
                            ""Note"" TEXT,
                            ""PaidAt"" TEXT,
                            ""CreatedAt"" TEXT NOT NULL DEFAULT (datetime('now'))
                        );
                    ");
                } catch {}
            }

            // Gieo dữ liệu SystemSettings mặc định nếu bảng trống
            if (!db.SystemSettings.Any())
            {
                db.SystemSettings.AddRange(
                    new SystemSetting { Key = "CenterName", Value = "Ms Nhu Fast English", Description = "Tên trung tâm" },
                    new SystemSetting { Key = "Hotline", Value = "0905 123 456", Description = "Số điện thoại hotline" },
                    new SystemSetting { Key = "Address", Value = "123 Đường Ba Tháng Hai, Đà Nẵng", Description = "Địa chỉ trung tâm" },
                    new SystemSetting { Key = "FacebookUrl", Value = "https://facebook.com/msnhu.fastenglish", Description = "Liên kết trang Facebook" },
                    new SystemSetting { Key = "Email", Value = "contact@msnhufastenglish.com", Description = "Email liên hệ" }
                );
                db.SaveChanges();
            }

            // Gieo dữ liệu BlogCategories mặc định nếu bảng trống
            if (!db.BlogCategories.Any())
            {
                db.BlogCategories.AddRange(
                    new BlogCategory { Id = 1, Name = "Tin tức", Slug = "tin-tuc", SortOrder = 1 },
                    new BlogCategory { Id = 2, Name = "Kinh nghiệm học", Slug = "kinh-nghiem-hoc", SortOrder = 2 },
                    new BlogCategory { Id = 3, Name = "Thông báo", Slug = "thong-bao", SortOrder = 3 }
                );
                db.SaveChanges();
            }

            // ── Update old seed data formats if they exist ───────────────────
            // 1. Update Admin (admin -> admin@gmail.com)
            var oldAdmin = db.Users.FirstOrDefault(u => u.Email == "admin" || u.Username == "admin");
            if (oldAdmin != null)
            {
                oldAdmin.Email = "admin@gmail.com";
                oldAdmin.Username = "admin";
            }

            // 2. Update Teacher 1 (nampnhse173502@fpt.edu.vn -> teacher1@gmail.com)
            var oldTeacher1 = db.Users.FirstOrDefault(u => u.Email == "nampnhse173502@fpt.edu.vn" || u.Username == "namph");
            if (oldTeacher1 != null)
            {
                oldTeacher1.Email = "teacher1@gmail.com";
                oldTeacher1.Username = "teacher1";
                oldTeacher1.FullName = "Giáo viên 1";
            }

            // 3. Update Teacher 2 (teacher -> teacher2@gmail.com)
            var oldTeacher2 = db.Users.FirstOrDefault(u => u.Email == "teacher" || u.Username == "teacher");
            if (oldTeacher2 != null)
            {
                oldTeacher2.Email = "teacher2@gmail.com";
                oldTeacher2.Username = "teacher2";
                oldTeacher2.FullName = "Giáo viên 2";
            }

            // 4. Update Students (user1@gmail.com -> student1@gmail.com)
            for (int i = 1; i <= 30; i++)
            {
                var oldEmail = $"user{i}@gmail.com";
                var studentUser = db.Users.FirstOrDefault(u => u.Email == oldEmail || u.Username == $"user{i}");
                if (studentUser != null)
                {
                    studentUser.Email = $"student{i}@gmail.com";
                    studentUser.Username = $"student{i}";
                    studentUser.FullName = $"Học viên {i}";
                }
            }
            db.SaveChanges();

            // ── Add Email CHECK constraint ─────────────────────────────────────
            if (db.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                db.Database.ExecuteSqlRaw(@"
                    ALTER TABLE ""Users"" DROP CONSTRAINT IF EXISTS ""CK_User_Email_Format"";
                    ALTER TABLE ""Users"" ADD CONSTRAINT ""CK_User_Email_Format"" CHECK (""Email"" LIKE '%@%');
                ");
            }
            else
            {
                try
                {
                    db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD CONSTRAINT ""CK_User_Email_Format"" CHECK (""Email"" LIKE '%@%');");
                }
                catch { }
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

    // Seed Admin — admin@gmail.com
    if (!db.Users.Any(u => u.Email == "admin@gmail.com"))
    {
        var admin = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = "Kim Hà",
            Email        = "admin@gmail.com",
            Username     = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            IsActive     = true,
        };
        admin.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = 1, AssignedAt = DateTime.UtcNow });
        db.Users.Add(admin);
        db.SaveChanges();
    }

    // Seed Teacher 1 — teacher1@gmail.com
    if (!db.Users.Any(u => u.Email == "teacher1@gmail.com"))
    {
        var teacher = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = "Giáo viên 1",
            Email        = "teacher1@gmail.com",
            Username     = "teacher1",
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

    // Seed Teacher 2 — teacher2@gmail.com
    if (!db.Users.Any(u => u.Email == "teacher2@gmail.com"))
    {
        var teacher = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = "Giáo viên 2",
            Email        = "teacher2@gmail.com",
            Username     = "teacher2",
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

    // Seed 30 Students: student1@gmail.com to student30@gmail.com
    var hasNewStudents = false;
    for (int i = 1; i <= 30; i++)
    {
        var email = $"student{i}@gmail.com";
        var username = $"student{i}";
        if (!db.Users.Any(u => u.Email == email))
        {
            var student = new User
            {
                Id           = Guid.NewGuid(),
                FullName     = $"Học viên {i}",
                Email        = email,
                Username     = username,
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
        var teacherUser = db.Users.FirstOrDefault(u => u.Email == "teacher1@gmail.com");
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

                // Seed Sessions
                var s1 = new ClassSession { Id = Guid.NewGuid(), ClassId = cls.Id, SessionNumber = 1, SessionDate = cls.StartDate, StartTime = "18:00", EndTime = "19:30", Topic = "Unit 1: Pronunciation & Phonics Guide", Note = "Luyện phát âm chuẩn IPA và cách nhận biết các âm cơ bản." };
                var s2 = new ClassSession { Id = Guid.NewGuid(), ClassId = cls.Id, SessionNumber = 2, SessionDate = cls.StartDate.AddDays(2), StartTime = "18:00", EndTime = "19:30", Topic = "Unit 2: Greeting & Small Talk", Note = "Cách bắt đầu một cuộc hội thoại cơ bản với người nước ngoài." };
                var s3 = new ClassSession { Id = Guid.NewGuid(), ClassId = cls.Id, SessionNumber = 3, SessionDate = cls.StartDate.AddDays(4), StartTime = "18:00", EndTime = "19:30", Topic = "Unit 3: Simple Present & Daily Routines", Note = "Sử dụng thì hiện tại đơn để mô tả các hoạt động hàng ngày." };
                db.ClassSessions.AddRange(s1, s2, s3);

                // Seed Class Documents
                db.ClassDocuments.Add(new ClassDocument { Id = Guid.NewGuid(), ClassId = cls.Id, Title = "Đề cương chi tiết khóa học.pdf", FileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", FileType = "pdf", FileSizeKb = 120, UploadedBy = teacherUser.Id, CreatedAt = DateTime.UtcNow });
                db.ClassDocuments.Add(new ClassDocument { Id = Guid.NewGuid(), ClassId = cls.Id, SessionId = s1.Id, Title = "Bảng phiên âm quốc tế IPA.pdf", FileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", FileType = "pdf", FileSizeKb = 250, UploadedBy = teacherUser.Id, CreatedAt = DateTime.UtcNow });
                db.ClassDocuments.Add(new ClassDocument { Id = Guid.NewGuid(), ClassId = cls.Id, SessionId = s2.Id, Title = "Greeting Vocabulary Worksheet.docx", FileUrl = "https://calibre-ebook.com/downloads/demos/demo.docx", FileType = "word", FileSizeKb = 95, UploadedBy = teacherUser.Id, CreatedAt = DateTime.UtcNow });
                
                // Seed Class Assignments
                db.ClassAssignments.Add(new ClassAssignment 
                { 
                    Id = Guid.NewGuid(), 
                    ClassId = cls.Id, 
                    Title = "Bài tập Unit 1: Ghi âm đoạn hội thoại tự giới thiệu bản thân", 
                    Description = "Học sinh tự thiết kế một kịch bản giới thiệu bản thân tối thiểu 5 câu và thực hiện ghi âm/quay video rồi nộp link drive bài làm lên đây.", 
                    DueDate = DateTime.UtcNow.AddDays(7),
                    CreatedAt = DateTime.UtcNow
                });
                db.ClassAssignments.Add(new ClassAssignment 
                { 
                    Id = Guid.NewGuid(), 
                    ClassId = cls.Id, 
                    Title = "Bài tập Unit 3: Trắc nghiệm & viết lại câu với Thì hiện tại đơn", 
                    Description = "Hoàn thành file bài tập worksheet đính kèm (hoặc trả lời trực tiếp trong phần bài làm).", 
                    DueDate = DateTime.UtcNow.AddDays(14),
                    CreatedAt = DateTime.UtcNow
                });
            }
            
            // Seed Curriculum Templates
            if (!db.CurriculumTemplates.Any())
            {
                var template1 = new CurriculumTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Chương trình Giao tiếp tiếng Anh cơ bản (Ms Nhu Fast English)",
                    Description = "Lộ trình học giao tiếp 12 buổi thiết kế dành riêng cho học viên mất gốc tiếng Anh, tập trung phát âm chuẩn IPA và phản xạ giao tiếp tự nhiên.",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.CurriculumTemplates.Add(template1);

                var t1Units = new List<CurriculumTemplateUnit>
                {
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 1, Topic = "Unit 1: Pronunciation & Phonics Guide", Note = "Luyện phát âm chuẩn IPA và cách nhận biết các âm cơ bản." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 2, Topic = "Unit 2: Greeting & Small Talk", Note = "Cách bắt đầu một cuộc hội thoại cơ bản với người nước ngoài." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 3, Topic = "Unit 3: Simple Present & Daily Routines", Note = "Sử dụng thì hiện tại đơn để mô tả các hoạt động hàng ngày." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 4, Topic = "Unit 4: Directions & Travel Vocabulary", Note = "Học từ vựng và cấu trúc hỏi đường, đi du lịch." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 5, Topic = "Unit 5: Shopping & Price Negotiation", Note = "Cách mặc cả và mua sắm trong tiếng Anh." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 6, Topic = "Unit 6: Ordering Food at a Restaurant", Note = "Cách gọi món và tương tác tại nhà hàng." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 7, Topic = "Unit 7: Past Simple & Talking about the Past", Note = "Kể về các sự kiện đã qua bằng thì quá khứ đơn." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 8, Topic = "Unit 8: Future Plans & Intentions", Note = "Cách diễn tả dự định tương lai với 'be going to' và 'will'." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 9, Topic = "Unit 9: Describing People & Personalities", Note = "Cách mô tả ngoại hình và tính cách của một người." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 10, Topic = "Unit 10: Talking about Hobbies & Free Time", Note = "Các chủ đề yêu thích và cách thể hiện sở thích cá nhân." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 11, Topic = "Unit 11: Workplace English Basics", Note = "Tiếng Anh giao tiếp cơ bản trong văn phòng." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template1.Id, SessionNumber = 12, Topic = "Unit 12: Final Review & Interactive Speaking", Note = "Tổng kết khóa học, thực hành đối thoại phản xạ trực tiếp." }
                };
                db.CurriculumTemplateUnits.AddRange(t1Units);

                var template2 = new CurriculumTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Lộ trình luyện thi IELTS Starter 5.0 (Ms Nhu Fast English)",
                    Description = "Khung giáo trình luyện thi IELTS giai đoạn khởi động (24 buổi), giúp học viên xây dựng nền tảng từ vựng, ngữ pháp cốt lõi và làm quen 4 kỹ năng theo format đề thi chuẩn.",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.CurriculumTemplates.Add(template2);

                var t2Units = new List<CurriculumTemplateUnit>
                {
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 1, Topic = "Unit 1: Intro to IELTS Listening & Reading", Note = "Làm quen với cấu trúc đề và các chiến thuật làm bài cơ bản." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 2, Topic = "Unit 2: IELTS Writing Task 1 - Chart & Graph Basics", Note = "Cách phân tích biểu đồ cột, biểu đồ đường đơn giản." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 3, Topic = "Unit 3: IELTS Speaking Part 1 Strategy", Note = "Mẹo trả lời tự nhiên và trôi chảy cho các chủ đề thường gặp." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 4, Topic = "Unit 4: Grammatical Accuracy: Tenses Overview", Note = "Ôn tập các thì động từ trọng tâm thường dùng trong IELTS." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 5, Topic = "Unit 5: Reading Skill: True/False/Not Given", Note = "Cách xác định thông tin và mẹo phân biệt False vs Not Given." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 6, Topic = "Unit 6: Writing Task 2 - Essay Structure", Note = "Cấu trúc bài viết nghị luận xã hội IELTS chuẩn." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 7, Topic = "Unit 7: Listening: Section 1 Strategies", Note = "Luyện tập nghe thông tin số, tên riêng và biểu mẫu." },
                    new CurriculumTemplateUnit { Id = Guid.NewGuid(), TemplateId = template2.Id, SessionNumber = 8, Topic = "Unit 8: Speaking Part 2 - Cue Card Preparation", Note = "Cách chuẩn bị ý tưởng trong 1 phút cho bài nói Part 2." }
                };
                db.CurriculumTemplateUnits.AddRange(t2Units);
            }
            db.SaveChanges();
        }
    }
}

app.UseExceptionHandler();

// Khởi tạo thư mục uploads nếu chưa có
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Serve file tĩnh của thư mục uploads qua đường dẫn /api/uploads
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/api/uploads"
});

app.UseRateLimiter();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
