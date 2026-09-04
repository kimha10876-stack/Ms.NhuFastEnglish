using System.ComponentModel.DataAnnotations;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class SystemSetting
{
    [Key]
    public string Key { get; set; } = default!;
    public string Value { get; set; } = default!;
    public string? Description { get; set; }
}
