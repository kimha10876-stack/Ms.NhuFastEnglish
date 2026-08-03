using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class CurriculumTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CurriculumTemplateUnit> Units { get; set; } = new List<CurriculumTemplateUnit>();
}
