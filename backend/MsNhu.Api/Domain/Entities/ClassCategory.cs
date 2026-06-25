namespace MsNhu.Api.Domain.Entities;

public class ClassCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string ColorHex { get; set; } = "#007AFF";
    public string Icon { get; set; } = "book";
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Class> Classes { get; set; } = new List<Class>();
}
