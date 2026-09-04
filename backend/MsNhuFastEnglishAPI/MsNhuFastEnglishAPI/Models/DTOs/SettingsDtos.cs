namespace MsNhuFastEnglishAPI.Models.DTOs;

public record SystemSettingDto(
    string Key,
    string Value,
    string? Description
);

public record SaveSettingsRequest(
    IDictionary<string, string> Settings
);

public record UserWithRolesDto(
    Guid Id,
    string FullName,
    string Email,
    bool IsActive,
    IList<string> Roles
);

public record UpdateUserRolesRequest(
    IList<string> Roles
);

public record CreateCategoryRequest(
    string Name,
    string? ColorHex,
    string? Icon,
    int? SortOrder
);

public record UpdateCategoryRequest(
    string? Name,
    string? ColorHex,
    string? Icon,
    int? SortOrder,
    bool? IsActive
);
