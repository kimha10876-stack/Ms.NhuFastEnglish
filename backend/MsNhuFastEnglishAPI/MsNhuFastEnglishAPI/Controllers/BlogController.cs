using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/blog")]
public class BlogController(AppDbContext db) : ControllerBase
{
    // ── PUBLIC ENDPOINTS ───────────────────────────────────────────────────

    // GET /api/blog/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await db.BlogCategories
            .OrderBy(c => c.SortOrder)
            .Select(c => new BlogCategoryDto(c.Id, c.Name, c.Slug, c.SortOrder))
            .ToListAsync();

        return Ok(ApiResponse.Ok(categories));
    }

    // GET /api/blog/posts
    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts(
        [FromQuery] int? categoryId = null,
        [FromQuery] string categorySlug = "",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9)
    {
        var query = db.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .Where(p => p.IsPublished)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(p => p.Category != null && p.Category.Slug == categorySlug.Trim().ToLower());
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostDto(
                p.Id,
                p.Title,
                p.Slug,
                p.ThumbnailUrl,
                p.Summary,
                p.Content,
                p.IsPublished,
                p.CreatedAt,
                p.UpdatedAt,
                p.ViewCount,
                p.AuthorId,
                p.Author.FullName,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.Category != null ? p.Category.Slug : null
            ))
            .ToListAsync();

        var result = new PaginatedListDto<BlogPostDto>(items, totalCount, page, pageSize, totalPages);
        return Ok(ApiResponse.Ok(result));
    }

    // GET /api/blog/posts/{slug}
    [HttpGet("posts/{slug}")]
    public async Task<IActionResult> GetPostDetail(string slug)
    {
        var post = await db.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug.Trim().ToLower() && p.IsPublished);

        if (post is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy bài viết"));

        // Incremental View Count
        post.ViewCount += 1;
        await db.SaveChangesAsync();

        var dto = new BlogPostDto(
            post.Id,
            post.Title,
            post.Slug,
            post.ThumbnailUrl,
            post.Summary,
            post.Content,
            post.IsPublished,
            post.CreatedAt,
            post.UpdatedAt,
            post.ViewCount,
            post.AuthorId,
            post.Author.FullName,
            post.CategoryId,
            post.Category != null ? post.Category.Name : null,
            post.Category != null ? post.Category.Slug : null
        );

        return Ok(ApiResponse.Ok(dto));
    }

    // ── ADMIN & TEACHER MANAGEMENT ENDPOINTS ───────────────────────────────

    // GET /api/blog/admin/posts
    [HttpGet("admin/posts")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetAdminPosts(
        [FromQuery] string search = "",
        [FromQuery] int? categoryId = null,
        [FromQuery] bool? isPublished = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = db.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(term) || p.Summary.ToLower().Contains(term));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (isPublished.HasValue)
        {
            query = query.Where(p => p.IsPublished == isPublished.Value);
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostDto(
                p.Id,
                p.Title,
                p.Slug,
                p.ThumbnailUrl,
                p.Summary,
                p.Content,
                p.IsPublished,
                p.CreatedAt,
                p.UpdatedAt,
                p.ViewCount,
                p.AuthorId,
                p.Author.FullName,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.Category != null ? p.Category.Slug : null
            ))
            .ToListAsync();

        var result = new PaginatedListDto<BlogPostDto>(items, totalCount, page, pageSize, totalPages);
        return Ok(ApiResponse.Ok(result));
    }

    // GET /api/blog/admin/posts/{id}
    [HttpGet("admin/posts/{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetAdminPostDetail(Guid id)
    {
        var post = await db.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy bài viết"));

        var dto = new BlogPostDto(
            post.Id,
            post.Title,
            post.Slug,
            post.ThumbnailUrl,
            post.Summary,
            post.Content,
            post.IsPublished,
            post.CreatedAt,
            post.UpdatedAt,
            post.ViewCount,
            post.AuthorId,
            post.Author.FullName,
            post.CategoryId,
            post.Category?.Name,
            post.Category?.Slug
        );

        return Ok(ApiResponse.Ok(dto));
    }

    // POST /api/blog/admin/posts
    [HttpPost("admin/posts")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(ApiResponse.BadRequest("Tiêu đề bài viết không được để trống"));

        if (string.IsNullOrWhiteSpace(req.Summary))
            return BadRequest(ApiResponse.BadRequest("Tóm tắt bài viết không được để trống"));

        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(ApiResponse.BadRequest("Nội dung bài viết không được để trống"));

        var authorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Generate and ensure unique slug
        var slug = GenerateSlug(req.Title);
        var baseSlug = slug;
        int count = 1;
        while (await db.BlogPosts.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{baseSlug}-{count}";
            count++;
        }

        var post = new BlogPost
        {
            Id = Guid.NewGuid(),
            Title = req.Title.Trim(),
            Slug = slug,
            ThumbnailUrl = string.IsNullOrWhiteSpace(req.ThumbnailUrl) ? null : req.ThumbnailUrl.Trim(),
            Summary = req.Summary.Trim(),
            Content = req.Content.Trim(),
            IsPublished = req.IsPublished,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ViewCount = 0,
            AuthorId = authorId,
            CategoryId = req.CategoryId
        };

        db.BlogPosts.Add(post);
        await db.SaveChangesAsync();

        // Reload to include relations for the return DTO
        var createdPost = await db.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .FirstAsync(p => p.Id == post.Id);

        var dto = new BlogPostDto(
            createdPost.Id,
            createdPost.Title,
            createdPost.Slug,
            createdPost.ThumbnailUrl,
            createdPost.Summary,
            createdPost.Content,
            createdPost.IsPublished,
            createdPost.CreatedAt,
            createdPost.UpdatedAt,
            createdPost.ViewCount,
            createdPost.AuthorId,
            createdPost.Author.FullName,
            createdPost.CategoryId,
            createdPost.Category?.Name,
            createdPost.Category?.Slug
        );

        return StatusCode(201, ApiResponse.Created(dto, "Tạo bài viết thành công"));
    }

    // PUT /api/blog/admin/posts/{id}
    [HttpPut("admin/posts/{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostRequest req)
    {
        var post = await db.BlogPosts.FirstOrDefaultAsync(p => p.Id == id);
        if (post is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy bài viết"));

        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(ApiResponse.BadRequest("Tiêu đề bài viết không được để trống"));

        if (string.IsNullOrWhiteSpace(req.Summary))
            return BadRequest(ApiResponse.BadRequest("Tóm tắt bài viết không được để trống"));

        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(ApiResponse.BadRequest("Nội dung bài viết không được để trống"));

        // If title changed, update the slug
        if (post.Title.ToLower() != req.Title.Trim().ToLower())
        {
            var slug = GenerateSlug(req.Title);
            var baseSlug = slug;
            int count = 1;
            while (await db.BlogPosts.AnyAsync(p => p.Slug == slug && p.Id != id))
            {
                slug = $"{baseSlug}-{count}";
                count++;
            }
            post.Slug = slug;
        }

        post.Title = req.Title.Trim();
        post.ThumbnailUrl = string.IsNullOrWhiteSpace(req.ThumbnailUrl) ? null : req.ThumbnailUrl.Trim();
        post.Summary = req.Summary.Trim();
        post.Content = req.Content.Trim();
        post.IsPublished = req.IsPublished;
        post.CategoryId = req.CategoryId;
        post.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        // Reload to include relations for the return DTO
        var updatedPost = await db.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .FirstAsync(p => p.Id == post.Id);

        var dto = new BlogPostDto(
            updatedPost.Id,
            updatedPost.Title,
            updatedPost.Slug,
            updatedPost.ThumbnailUrl,
            updatedPost.Summary,
            updatedPost.Content,
            updatedPost.IsPublished,
            updatedPost.CreatedAt,
            updatedPost.UpdatedAt,
            updatedPost.ViewCount,
            updatedPost.AuthorId,
            updatedPost.Author.FullName,
            updatedPost.CategoryId,
            updatedPost.Category?.Name,
            updatedPost.Category?.Slug
        );

        return Ok(ApiResponse.Ok(dto, "Cập nhật bài viết thành công"));
    }

    // DELETE /api/blog/admin/posts/{id}
    [HttpDelete("admin/posts/{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var post = await db.BlogPosts.FirstOrDefaultAsync(p => p.Id == id);
        if (post is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy bài viết"));

        db.BlogPosts.Remove(post);
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Xóa bài viết thành công"));
    }

    // POST /api/blog/admin/categories
    [HttpPost("admin/categories")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateBlogCategoryRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(ApiResponse.BadRequest("Tên danh mục không được trống"));

        var slug = GenerateSlug(req.Name);
        if (await db.BlogCategories.AnyAsync(c => c.Slug == slug))
            return BadRequest(ApiResponse.BadRequest("Danh mục này đã tồn tại"));

        var category = new BlogCategory
        {
            Name = req.Name.Trim(),
            Slug = slug,
            SortOrder = req.SortOrder
        };

        db.BlogCategories.Add(category);
        await db.SaveChangesAsync();

        var dto = new BlogCategoryDto(category.Id, category.Name, category.Slug, category.SortOrder);
        return StatusCode(201, ApiResponse.Created(dto, "Tạo danh mục thành công"));
    }

    // PUT /api/blog/admin/categories/{id}
    [HttpPut("admin/categories/{id:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateBlogCategoryRequest req)
    {
        var category = await db.BlogCategories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy danh mục"));

        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(ApiResponse.BadRequest("Tên danh mục không được trống"));

        var slug = GenerateSlug(req.Name);
        if (await db.BlogCategories.AnyAsync(c => c.Slug == slug && c.Id != id))
            return BadRequest(ApiResponse.BadRequest("Danh mục trùng tên hoặc slug đã tồn tại"));

        category.Name = req.Name.Trim();
        category.Slug = slug;
        category.SortOrder = req.SortOrder;

        await db.SaveChangesAsync();

        var dto = new BlogCategoryDto(category.Id, category.Name, category.Slug, category.SortOrder);
        return Ok(ApiResponse.Ok(dto, "Cập nhật danh mục thành công"));
    }

    // DELETE /api/blog/admin/categories/{id}
    [HttpDelete("admin/categories/{id:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await db.BlogCategories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return NotFound(ApiResponse.NotFound("Không tìm thấy danh mục"));

        db.BlogCategories.Remove(category);
        await db.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object?>(null, "Xóa danh mục thành công"));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        // Convert to lowercase
        text = text.ToLowerInvariant();

        // Replace accented characters
        string[] accents = {
            "aàáảãạâầấẩẫậăằắẳẵặ",
            "eèéẻẽẹêềếểễệ",
            "iìíỉĩị",
            "oòóỏõọôồốổỗộơờớởỡợ",
            "uùúủũụưừứửữự",
            "yỳýỷỹỵ",
            "dđ"
        };
        string[] replacements = { "a", "e", "i", "o", "u", "y", "d" };

        for (int i = 0; i < accents.Length; i++)
        {
            foreach (char c in accents[i])
            {
                text = text.Replace(c.ToString(), replacements[i]);
            }
        }

        // Remove invalid characters
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[^a-z0-9\s-]", "");

        // Replace multiple spaces or hyphens with a single hyphen
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[\s-]+", "-").Trim('-');

        return text;
    }
}
