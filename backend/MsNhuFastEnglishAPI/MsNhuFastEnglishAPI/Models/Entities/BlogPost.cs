using System;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class BlogPost
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? ThumbnailUrl { get; set; }
    public string Summary { get; set; } = default!;
    public string Content { get; set; } = default!;
    public bool IsPublished { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int ViewCount { get; set; } = 0;

    // Foreign Keys
    public Guid AuthorId { get; set; }
    public int? CategoryId { get; set; }

    // Navigation properties
    public User Author { get; set; } = default!;
    public BlogCategory? Category { get; set; }
}
