using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsNhuFastEnglishAPI.Data;
using MsNhuFastEnglishAPI.Models.DTOs;
using MsNhuFastEnglishAPI.Models.Entities;
using MsNhuFastEnglishAPI.Shared;

namespace MsNhuFastEnglishAPI.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public class ClassAssignmentsController(AppDbContext db) : ControllerBase
{
    private Guid UserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin =>
        User.IsInRole("Admin");

    // ── GET /api/classes/my-assignments ───────────────────────────────────────
    [HttpGet("my-assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null)
        {
            profile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = UserId,
                Level = "Mới bắt đầu",
                Goal = "Giao tiếp cơ bản",
                Status = "active"
            };
            db.StudentProfiles.Add(profile);
            await db.SaveChangesAsync();
        }

        var assignments = await db.ClassAssignments
            .Include(a => a.Class)
                .ThenInclude(c => c.Category)
            .Include(a => a.Class)
                .ThenInclude(c => c.Teacher)
            .Include(a => a.Submissions)
            .Where(a => a.Class.ClassMembers.Any(m => m.StudentId == profile.Id && m.Status.ToLower() == "active") && (a.Class.Status == null || a.Class.Status.ToLower() == "active"))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;

        var dtos = assignments.Select(a => {
            var mySub = a.Submissions.FirstOrDefault(s => s.StudentId == profile.Id);
            var isSubmitted = mySub != null;
            var isOverdue = !isSubmitted && a.DueDate.HasValue && a.DueDate.Value < now;

            return new StudentAssignmentItemDto(
                AssignmentId:        a.Id,
                ClassId:             a.ClassId,
                ClassName:           a.Class.Name,
                CategoryName:        a.Class.Category.Name,
                CategoryColorHex:    a.Class.Category.ColorHex,
                TeacherName:         a.Class.Teacher.FullName,
                Title:               a.Title,
                Description:         a.Description,
                DueDate:             a.DueDate,
                CreatedAt:           a.CreatedAt,
                AssignmentType:      a.AssignmentType,
                AllowLateSubmission: a.AllowLateSubmission,
                IsSubmitted:         isSubmitted,
                SubmittedAt:         mySub?.SubmittedAt,
                Grade:               mySub?.Grade,
                TeacherFeedback:     mySub?.TeacherFeedback,
                IsOverdue:           isOverdue
            );
        }).OrderBy(a => a.IsSubmitted)
          .ThenBy(a => a.DueDate ?? DateTime.MaxValue)
          .ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    // ── GET /api/classes/{id}/assignments ────────────────────────────────────
    [HttpGet("{id:guid}/assignments")]
    public async Task<IActionResult> GetAssignments(Guid id)
    {
        var isStudent = User.IsInRole("Student");
        Guid? studentId = null;

        if (isStudent)
        {
            var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
            if (profile != null) studentId = profile.Id;
        }

        var assignments = await db.ClassAssignments
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
                    .ThenInclude(st => st.User)
            .Where(a => a.ClassId == id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var dtos = assignments.Select(a => {
            AssignmentSubmissionDto? submissionDto = null;
            if (isStudent && studentId.HasValue)
            {
                var sub = a.Submissions.FirstOrDefault(s => s.StudentId == studentId.Value);
                if (sub != null)
                {
                    submissionDto = new AssignmentSubmissionDto(
                        Id: sub.Id,
                        AssignmentId: sub.AssignmentId,
                        AssignmentTitle: a.Title,
                        StudentId: sub.StudentId,
                        StudentName: sub.Student.User.FullName,
                        StudentEmail: sub.Student.User.Email,
                        SubmissionText: sub.SubmissionText,
                        FileUrl: sub.FileUrl,
                        FileName: sub.FileName,
                        AnswersJson: sub.AnswersJson,
                        SubmittedAt: sub.SubmittedAt,
                        Grade: sub.Grade,
                        TeacherFeedback: sub.TeacherFeedback
                    );
                }
            }

            return new ClassAssignmentDto(
                Id: a.Id,
                ClassId: a.ClassId,
                Title: a.Title,
                Description: a.Description,
                DueDate: a.DueDate,
                CreatedAt: a.CreatedAt,
                AssignmentType: a.AssignmentType,
                AllowLateSubmission: a.AllowLateSubmission,
                QuestionsJson: a.QuestionsJson,
                Submission: submissionDto,
                SubmissionsCount: a.Submissions.Count
            );
        }).ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    // ── GET /api/classes/assignments/{assignmentId} ──────────────────────────
    [HttpGet("assignments/{assignmentId:guid}")]
    public async Task<IActionResult> GetAssignmentDetail(Guid assignmentId)
    {
        var a = await db.ClassAssignments
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
                    .ThenInclude(st => st.User)
            .FirstOrDefaultAsync(x => x.Id == assignmentId);

        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        var isStudent = User.IsInRole("Student");
        AssignmentSubmissionDto? submissionDto = null;

        if (isStudent)
        {
            var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
            if (profile != null)
            {
                var sub = a.Submissions.FirstOrDefault(s => s.StudentId == profile.Id);
                if (sub != null)
                {
                    submissionDto = new AssignmentSubmissionDto(
                        Id: sub.Id,
                        AssignmentId: sub.AssignmentId,
                        AssignmentTitle: a.Title,
                        StudentId: sub.StudentId,
                        StudentName: sub.Student.User.FullName,
                        StudentEmail: sub.Student.User.Email,
                        SubmissionText: sub.SubmissionText,
                        FileUrl: sub.FileUrl,
                        FileName: sub.FileName,
                        AnswersJson: sub.AnswersJson,
                        SubmittedAt: sub.SubmittedAt,
                        Grade: sub.Grade,
                        TeacherFeedback: sub.TeacherFeedback
                    );
                }
            }
        }

        var dto = new ClassAssignmentDto(
            Id: a.Id,
            ClassId: a.ClassId,
            Title: a.Title,
            Description: a.Description,
            DueDate: a.DueDate,
            CreatedAt: a.CreatedAt,
            AssignmentType: a.AssignmentType,
            AllowLateSubmission: a.AllowLateSubmission,
            QuestionsJson: a.QuestionsJson,
            Submission: submissionDto,
            SubmissionsCount: a.Submissions.Count
        );

        return Ok(ApiResponse.Ok(dto));
    }

    // ── POST /api/classes/{id}/assignments ───────────────────────────────────
    [HttpPost("{id:guid}/assignments")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> CreateAssignment(Guid id, [FromBody] CreateAssignmentRequest req)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls == null) return NotFound(ApiResponse.NotFound("Lớp học không tồn tại"));

        var assignment = new ClassAssignment
        {
            Id = Guid.NewGuid(),
            ClassId = id,
            Title = req.Title,
            Description = req.Description,
            DueDate = req.DueDate,
            AssignmentType = req.AssignmentType ?? "Upload",
            AllowLateSubmission = req.AllowLateSubmission ?? true,
            QuestionsJson = req.QuestionsJson,
            CreatedAt = DateTime.UtcNow
        };

        db.ClassAssignments.Add(assignment);
        await db.SaveChangesAsync();

        return StatusCode(201, ApiResponse.Created(new { assignment.Id }, "Giao bài tập thành công"));
    }

    // ── PUT /api/classes/assignments/{assignmentId} ──────────────────────────
    [HttpPut("assignments/{assignmentId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdateAssignment(Guid assignmentId, [FromBody] UpdateAssignmentRequest req)
    {
        var a = await db.ClassAssignments.FindAsync(assignmentId);
        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        if (req.Title != null) a.Title = req.Title;
        if (req.Description != null) a.Description = req.Description;
        if (req.AssignmentType != null) a.AssignmentType = req.AssignmentType;
        if (req.AllowLateSubmission.HasValue) a.AllowLateSubmission = req.AllowLateSubmission.Value;
        if (req.QuestionsJson != null) a.QuestionsJson = req.QuestionsJson;
        a.DueDate = req.DueDate;

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Cập nhật bài tập thành công"));
    }

    // ── DELETE /api/classes/assignments/{assignmentId} ───────────────────────
    [HttpDelete("assignments/{assignmentId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteAssignment(Guid assignmentId)
    {
        var a = await db.ClassAssignments.FindAsync(assignmentId);
        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        db.ClassAssignments.Remove(a);
        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Xóa bài tập thành công"));
    }

    // ── GET /api/classes/assignments/{assignmentId}/submissions ──────────────
    [HttpGet("assignments/{assignmentId:guid}/submissions")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetAssignmentSubmissions(Guid assignmentId)
    {
        var submissions = await db.AssignmentSubmissions
            .Include(s => s.Student)
                .ThenInclude(st => st.User)
            .Include(s => s.Assignment)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var dtos = submissions.Select(s => new AssignmentSubmissionDto(
            Id: s.Id,
            AssignmentId: s.AssignmentId,
            AssignmentTitle: s.Assignment.Title,
            StudentId: s.StudentId,
            StudentName: s.Student.User.FullName,
            StudentEmail: s.Student.User.Email,
            SubmissionText: s.SubmissionText,
            FileUrl: s.FileUrl,
            FileName: s.FileName,
            AnswersJson: s.AnswersJson,
            SubmittedAt: s.SubmittedAt,
            Grade: s.Grade,
            TeacherFeedback: s.TeacherFeedback
        )).ToList();

        return Ok(ApiResponse.Ok(dtos));
    }

    // ── POST /api/classes/assignments/{assignmentId}/submit ──────────────────
    [HttpPost("assignments/{assignmentId:guid}/submit")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> SubmitAssignment(Guid assignmentId, [FromBody] SubmitAssignmentRequest req)
    {
        var a = await db.ClassAssignments.FindAsync(assignmentId);
        if (a == null) return NotFound(ApiResponse.NotFound("Bài tập không tồn tại"));

        if (a.DueDate.HasValue && !a.AllowLateSubmission && DateTime.UtcNow > a.DueDate.Value)
        {
            return BadRequest(ApiResponse.BadRequest("Đã quá hạn nộp bài. Lớp học không cho phép nộp trễ."));
        }

        var profile = await db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == UserId);
        if (profile == null) return BadRequest(ApiResponse.BadRequest("Không tìm thấy hồ sơ học viên"));

        var sub = await db.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == profile.Id);

        if (sub != null)
        {
            sub.SubmissionText = req.SubmissionText;
            sub.FileUrl = req.FileUrl;
            sub.FileName = req.FileName;
            sub.SubmittedAt = DateTime.UtcNow;
            sub.AnswersJson = req.AnswersJson;
        }
        else
        {
            sub = new AssignmentSubmission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignmentId,
                StudentId = profile.Id,
                SubmissionText = req.SubmissionText,
                FileUrl = req.FileUrl,
                FileName = req.FileName,
                AnswersJson = req.AnswersJson,
                SubmittedAt = DateTime.UtcNow
            };
            db.AssignmentSubmissions.Add(sub);
        }

        if (a.AssignmentType == "Quiz" && !string.IsNullOrWhiteSpace(req.AnswersJson))
        {
            try
            {
                var questions = string.IsNullOrWhiteSpace(a.QuestionsJson)
                    ? new List<AssignmentQuestionDto>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<AssignmentQuestionDto>>(
                        a.QuestionsJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var answers = System.Text.Json.JsonSerializer.Deserialize<List<StudentAnswerDto>>(
                    req.AnswersJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (questions != null && answers != null)
                {
                    var gradedAnswers = new List<StudentAnswerDto>();
                    float autoGradedTotalScore = 0;
                    bool hasWritingQuestions = false;

                    foreach (var answer in answers)
                    {
                        var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                        if (question != null)
                        {
                            var qType = question.Type;
                            if (qType == "MultipleChoice" || qType == "TrueFalse" || qType == "FillInTheBlank")
                            {
                                var studentAns = (answer.AnswerText ?? "").Trim().ToLowerInvariant();
                                var correctAns = (question.CorrectAnswer ?? "").Trim().ToLowerInvariant();
                                bool isCorrect = studentAns == correctAns;

                                gradedAnswers.Add(new StudentAnswerDto(
                                    QuestionId: answer.QuestionId,
                                    AnswerText: answer.AnswerText,
                                    IsCorrect: isCorrect,
                                    Grade: isCorrect ? question.Points : 0,
                                    TeacherFeedback: null
                                ));

                                if (isCorrect)
                                {
                                    autoGradedTotalScore += question.Points;
                                }
                            }
                            else if (qType == "ShortAnswer")
                            {
                                if (!string.IsNullOrWhiteSpace(question.CorrectAnswer))
                                {
                                    var studentAns = (answer.AnswerText ?? "").Trim().ToLowerInvariant();
                                    var correctAns = (question.CorrectAnswer ?? "").Trim().ToLowerInvariant();
                                    bool isCorrect = studentAns == correctAns;

                                    gradedAnswers.Add(new StudentAnswerDto(
                                        QuestionId: answer.QuestionId,
                                        AnswerText: answer.AnswerText,
                                        IsCorrect: isCorrect,
                                        Grade: isCorrect ? question.Points : 0,
                                        TeacherFeedback: null
                                    ));

                                    if (isCorrect)
                                    {
                                        autoGradedTotalScore += question.Points;
                                    }
                                }
                                else
                                {
                                    hasWritingQuestions = true;
                                    gradedAnswers.Add(new StudentAnswerDto(
                                        QuestionId: answer.QuestionId,
                                        AnswerText: answer.AnswerText,
                                        IsCorrect: null,
                                        Grade: null,
                                        TeacherFeedback: null
                                    ));
                                }
                            }
                            else // Writing
                            {
                                hasWritingQuestions = true;
                                gradedAnswers.Add(new StudentAnswerDto(
                                    QuestionId: answer.QuestionId,
                                    AnswerText: answer.AnswerText,
                                    IsCorrect: null,
                                    Grade: null,
                                    TeacherFeedback: null
                                ));
                            }
                        }
                    }

                    sub.AnswersJson = System.Text.Json.JsonSerializer.Serialize(gradedAnswers, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });

                    if (!hasWritingQuestions)
                    {
                        sub.Grade = autoGradedTotalScore;
                    }
                    else
                    {
                        sub.Grade = null;
                    }
                }
            }
            catch
            {
                sub.AnswersJson = req.AnswersJson;
            }
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok(new { sub.Id }, "Nộp bài tập thành công"));
    }

    // ── POST /api/classes/assignments/submissions/{submissionId}/grade ────────
    [HttpPost("assignments/submissions/{submissionId:guid}/grade")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionRequest req)
    {
        var sub = await db.AssignmentSubmissions.FindAsync(submissionId);
        if (sub == null) return NotFound(ApiResponse.NotFound("Không tìm thấy bài nộp"));

        sub.Grade = req.Grade;
        sub.TeacherFeedback = req.TeacherFeedback;
        if (!string.IsNullOrWhiteSpace(req.AnswersJson))
        {
            sub.AnswersJson = req.AnswersJson;
        }

        await db.SaveChangesAsync();
        return Ok(ApiResponse.Ok<object?>(null, "Chấm điểm bài nộp thành công"));
    }
}
