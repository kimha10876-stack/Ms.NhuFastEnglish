using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MsNhu.Api.Infrastructure.Persistence;
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
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
                PermitLimit  = 5,
                Window       = TimeSpan.FromHours(1),
                QueueLimit   = 0,
            }));

    options.OnRejected = async (ctx, token) =>
    {
        ctx.HttpContext.Response.StatusCode  = 429;
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsync(
            "{\"message\":\"Quá nhiều yêu cầu, vui lòng thử lại sau 1 giờ\"}", token);
    };
});

// ── Features ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<MsNhu.Api.Features.Email.EmailService>();
builder.Services.AddScoped<MsNhu.Api.Features.Auth.AuthService>();

// ── Controllers + Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MsNhu API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
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

// Auto-create schema — retry nếu Postgres chưa sẵn sàng (Docker startup race)
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

    // Seed Admin user nếu chưa có
    var adminEmail = app.Configuration["Seed:AdminEmail"] ?? "admin@msnhu.com";
    if (!db.Users.Any(u => u.Email == adminEmail))
    {
        var adminPwd  = app.Configuration["Seed:AdminPassword"] ?? "Admin@123456";
        var adminUser = new MsNhu.Api.Domain.Entities.User
        {
            Id           = Guid.NewGuid(),
            FullName     = "Admin",
            Email        = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPwd),
            IsActive     = true,
        };
        adminUser.UserRoles.Add(new MsNhu.Api.Domain.Entities.UserRole
        {
            UserId     = adminUser.Id,
            RoleId     = 1, // Admin
            AssignedAt = DateTime.UtcNow,
        });
        db.Users.Add(adminUser);
        db.SaveChanges();

        var seedLogger = scope.ServiceProvider.GetRequiredService<ILogger<MsNhu.Api.Domain.Entities.User>>();
        seedLogger.LogInformation("✓ Seed Admin: {Email} / {Pwd}", adminEmail, adminPwd);
    }
}

app.UseRateLimiter();
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
