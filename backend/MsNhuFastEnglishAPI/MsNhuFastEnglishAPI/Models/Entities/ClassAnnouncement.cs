using System;
using System.Collections.Generic;

namespace MsNhuFastEnglishAPI.Models.Entities
{
    public class ClassAnnouncement
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public string Content { get; set; } = default!;
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Class Class { get; set; } = default!;
        public User Creator { get; set; } = default!;
        public ICollection<AnnouncementComment> Comments { get; set; } = new List<AnnouncementComment>();
    }
}
