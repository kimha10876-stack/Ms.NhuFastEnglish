using System;

namespace MsNhuFastEnglishAPI.Models.Entities
{
    public class AnnouncementComment
    {
        public Guid Id { get; set; }
        public Guid AnnouncementId { get; set; }
        public string Content { get; set; } = default!;
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ClassAnnouncement Announcement { get; set; } = default!;
        public User Creator { get; set; } = default!;
    }
}
