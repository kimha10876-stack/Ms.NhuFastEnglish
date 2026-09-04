namespace MsNhuFastEnglishAPI.Models.Entities;

public class BlogCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public int SortOrder { get; set; }

    // Navigation property
    public ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
}
