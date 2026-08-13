using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;

namespace MsNhuFastEnglishAPI.Services;

public class ConsultationService(AppDbContext db)
{
    // Create new consultation request from LandingPage
    public async Task<ConsultationRequestDto> CreateConsultationAsync(CreateConsultationRequest req)
    {
        var phoneTrimmed = req.Phone.Trim();
        var existing = await db.ConsultationRequests
            .FirstOrDefaultAsync(c => c.Phone == phoneTrimmed);

        if (existing != null)
        {
            existing.FullName = req.FullName.Trim();
            existing.Email = req.Email?.Trim();
            existing.Message = req.Message?.Trim();
            existing.Status = "new"; // Reset status to new so admin can see it again
            existing.RequestCount += 1;
            existing.CreatedAt = DateTime.UtcNow; // Update latest request time
            existing.ContactedAt = null; // Reset contacted time since it's a new request now
            
            await db.SaveChangesAsync();
            return MapToDto(existing);
        }

        var consultation = new ConsultationRequest
        {
            Id = Guid.NewGuid(),
            FullName = req.FullName.Trim(),
            Phone = phoneTrimmed,
            Email = req.Email?.Trim(),
            Message = req.Message?.Trim(),
            Status = "new",
            RequestCount = 1,
            CreatedAt = DateTime.UtcNow
        };

        db.ConsultationRequests.Add(consultation);
        await db.SaveChangesAsync();

        return MapToDto(consultation);
    }

    // Get paginated list of consultations (Admin only)
    public async Task<PaginatedListDto<ConsultationRequestDto>> GetConsultationsAsync(
        string? search, string? status, int page, int pageSize)
    {
        var query = db.ConsultationRequests.AsQueryable();

        // Search by FullName or Phone
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower().Trim();
            query = query.Where(c => c.FullName.ToLower().Contains(searchLower) || c.Phone.Contains(searchLower));
        }

        // Filter by Status
        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(c => c.Status == status.ToLower().Trim());
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        if (totalPages == 0) totalPages = 1;

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToDto(c))
            .ToListAsync();

        return new PaginatedListDto<ConsultationRequestDto>(items, totalCount, page, pageSize, totalPages);
    }

    // Count new consultation requests for sidebar badge
    public async Task<int> GetNewCountAsync()
    {
        return await db.ConsultationRequests.CountAsync(c => c.Status == "new");
    }

    // Update status and admin notes (Admin only)
    public async Task<ConsultationRequestDto?> UpdateStatusAsync(Guid id, UpdateConsultationStatusRequest req)
    {
        var consultation = await db.ConsultationRequests.FindAsync(id);
        if (consultation == null) return null;

        var oldStatus = consultation.Status;
        consultation.Status = req.Status.ToLower().Trim();
        consultation.AdminNote = req.AdminNote?.Trim();

        // If status changes from "new" to "contacted" (or others), update ContactedAt
        if (oldStatus == "new" && consultation.Status != "new")
        {
            consultation.ContactedAt = DateTime.UtcNow;
        }
        else if (consultation.Status == "new")
        {
            consultation.ContactedAt = null;
        }

        await db.SaveChangesAsync();
        return MapToDto(consultation);
    }

    // Delete a consultation request (Admin only)
    public async Task<bool> DeleteConsultationAsync(Guid id)
    {
        var consultation = await db.ConsultationRequests.FindAsync(id);
        if (consultation == null) return false;

        db.ConsultationRequests.Remove(consultation);
        await db.SaveChangesAsync();
        return true;
    }

    private static ConsultationRequestDto MapToDto(ConsultationRequest c)
    {
        return new ConsultationRequestDto(
            c.Id,
            c.FullName,
            c.Phone,
            c.Email,
            c.Message,
            c.Status,
            c.AdminNote,
            c.RequestCount,
            c.CreatedAt,
            c.ContactedAt
        );
    }
}
