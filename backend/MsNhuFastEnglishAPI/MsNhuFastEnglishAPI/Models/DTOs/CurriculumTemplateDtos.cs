using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record CreateCurriculumTemplateRequest(
    string Name,
    string? Description,
    List<TemplateDocumentDto>? Documents,
    List<CreateTemplateUnitRequest> Units
);

public record CreateTemplateUnitRequest(
    int SessionNumber,
    string? Topic,
    string? Note,
    List<TemplateDocumentDto>? Documents
);

public record TemplateDocumentDto(
    string Title,
    string FileUrl,
    string FileType,
    int FileSizeKb
);

public record ImportCurriculumRequest(
    Guid TemplateId,
    DateOnly StartDate,
    List<int> Weekdays // 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday
);

public record CurriculumTemplateDto(
    Guid Id,
    string Name,
    string? Description,
    List<TemplateDocumentDto> Documents,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<CurriculumTemplateUnitDto> Units
);

public record CurriculumTemplateUnitDto(
    Guid Id,
    int SessionNumber,
    string? Topic,
    string? Note,
    List<TemplateDocumentDto> Documents
);
