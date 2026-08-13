using System;
using System.ComponentModel.DataAnnotations;

namespace MsNhuFastEnglishAPI.Models.DTOs;

public record ConsultationRequestDto(
    Guid Id,
    string FullName,
    string Phone,
    string? Email,
    string? Message,
    string Status,
    string? AdminNote,
    int RequestCount,
    DateTime CreatedAt,
    DateTime? ContactedAt
);

public record CreateConsultationRequest(
    [Required(ErrorMessage = "Họ tên không được để trống")]
    string FullName,
    
    [Required(ErrorMessage = "Số điện thoại không được để trống")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    string Phone,
    
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    string? Email,
    
    string? Message
);

public record UpdateConsultationStatusRequest(
    [Required(ErrorMessage = "Trạng thái không được để trống")]
    string Status,
    
    string? AdminNote
);
