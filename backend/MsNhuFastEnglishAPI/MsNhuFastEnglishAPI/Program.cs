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
        try { db.Database.EnsureCreated(); break; }
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
