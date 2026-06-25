namespace MsNhu.Api.Domain.Entities;

public class ClassDocument
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    /// <summary>NULL = tài liệu chung của lớp, có giá trị = gắn với buổi cụ thể</summary>
    public Guid? SessionId { get; set; }
    public string Title { get; set; } = default!;
    public string FileUrl { get; set; } = default!;
    /// <summary>"pdf" | "word" | "ppt" | "other"</summary>
    public string FileType { get; set; } = default!;
    public int FileSizeKb { get; set; }
    public Guid UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }

    public Class Class { get; set; } = default!;
    public ClassSession? Session { get; set; }
    public User Uploader { get; set; } = default!;
}
