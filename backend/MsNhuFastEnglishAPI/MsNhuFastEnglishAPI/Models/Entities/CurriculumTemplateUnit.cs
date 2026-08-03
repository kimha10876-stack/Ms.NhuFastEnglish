using System;
using System.Text.Json.Serialization;

namespace MsNhuFastEnglishAPI.Models.Entities;

public class CurriculumTemplateUnit
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public int SessionNumber { get; set; }
    public string? Topic { get; set; }
    public string? Note { get; set; }
    /// <summary>JSON array of TemplateDocumentDto (Title, FileUrl, FileType, FileSizeKb)</summary>
    public string? DocumentsJson { get; set; }

    [JsonIgnore]
    public CurriculumTemplate Template { get; set; } = default!;
}
