using System;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record BlogCategoryDto(int Id, string Name, string Slug, int SortOrder);

public record BlogPostDto(
    Guid Id,
    string Title,
    string Slug,
    string? ThumbnailUrl,
    string Summary,
    string Content,
    bool IsPublished,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int ViewCount,
    Guid AuthorId,
    string AuthorName,
    int? CategoryId,
    string? CategoryName,
    string? CategorySlug
);

public record CreatePostRequest(
    string Title,
    string? ThumbnailUrl,
    string Summary,
    string Content,
    bool IsPublished,
    int? CategoryId
);

public record UpdatePostRequest(
    string Title,
    string? ThumbnailUrl,
    string Summary,
    string Content,
    bool IsPublished,
    int? CategoryId
);

public record CreateBlogCategoryRequest(string Name, string Slug, int SortOrder);

public record UpdateBlogCategoryRequest(string Name, string Slug, int SortOrder);
