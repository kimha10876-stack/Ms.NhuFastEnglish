export interface ClassSummary {
  id: string
  name: string
  categoryName: string
  categoryColorHex: string
  teacherName: string
  status: 'active' | 'paused' | 'ended'
  memberCount: number
  scheduleDays: string | null
  scheduleTime: string | null
  room: string | null
  startDate: string
  createdAt: string
}

export interface ClassMember {
  memberId: string
  studentId: string
  fullName: string
  email: string
  avatarUrl: string | null
  status: string
  joinedAt: string
}

export interface ClassDetail {
  id: string
  name: string
  categoryId: number
  categoryName: string
  categoryColorHex: string
  teacherId: string
  teacherName: string
  status: string
  scheduleDays: string | null
  scheduleTime: string | null
  room: string | null
  note: string | null
  maxStudents: number | null
  startDate: string
  endDate: string | null
  createdAt: string
  members: ClassMember[]
}

export interface CreateClassRequest {
  name: string
  categoryId: number
  teacherId: string
  startDate: string
  scheduleDays?: string
  scheduleTime?: string
  room?: string
  note?: string
  maxStudents?: number
  endDate?: string
}

export interface UpdateClassRequest {
  name?: string
  categoryId?: number
  teacherId?: string
  status?: string
  scheduleDays?: string
  scheduleTime?: string
  room?: string
  note?: string
  maxStudents?: number
  endDate?: string
  startDate?: string
}

export interface InviteInfo {
  classId: string
  className: string
  teacherName: string
  categoryName: string
  categoryColorHex: string
  memberCount: number
  maxStudents: number | null
}

export interface InviteLink {
  token: string
  inviteUrl: string
  expiresAt: string | null
}

export interface StudentSearchResult {
  studentId: string
  fullName: string
  email: string
  avatarUrl: string | null
}

export interface TeacherSearchResult {
  teacherId: string
  fullName: string
  email: string
  avatarUrl: string | null
}

export interface ClassCategory {
  id: number
  name: string
  colorHex: string
  icon: string
}

export interface CreateCategoryRequest {
  name: string
  colorHex?: string
  icon?: string
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  name?: string
  colorHex?: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ClassDocument {
  id: string
  classId: string
  sessionId: string | null
  title: string
  fileUrl: string
  fileType: string
  fileSizeKb: number
  uploadedBy: string
  uploadedByName: string
  createdAt: string
}

export interface ClassSession {
  id: string
  classId: string
  sessionNumber: number
  sessionDate: string
  startTime: string
  endTime: string
  topic: string | null
  note: string | null
  guestTeacherId: string | null
  guestTeacherName: string | null
  documents: ClassDocument[]
  attendanceStatus?: string | null
}

export interface AssignmentQuestion {
  id: string
  type: 'MultipleChoice' | 'TrueFalse' | 'FillInTheBlank' | 'ShortAnswer' | 'Writing'
  questionText: string
  options?: string[]
  correctAnswer?: string
  points: number
}

export interface StudentAnswer {
  questionId: string
  answerText: string
  isCorrect?: boolean
  grade?: number
  teacherFeedback?: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  assignmentTitle?: string
  studentId: string
  studentName: string
  studentEmail: string
  submissionText: string | null
  fileUrl: string | null
  fileName: string | null
  answersJson: string | null
  submittedAt: string
  grade: number | null
  teacherFeedback: string | null
}

export interface ClassAssignment {
  id: string
  classId: string
  title: string
  description: string
  dueDate: string | null
  assignmentType: 'Upload' | 'Quiz'
  allowLateSubmission: boolean
  questionsJson: string | null
  createdAt: string
  submission: AssignmentSubmission | null
  submissionsCount: number
}

// Request payloads
export interface CreateSessionRequest {
  sessionNumber: number
  sessionDate: string
  startTime: string
  endTime: string
  topic?: string
  note?: string
  guestTeacherId?: string
}

export interface UpdateSessionRequest {
  sessionNumber?: number
  sessionDate?: string
  startTime?: string
  endTime?: string
  topic?: string
  note?: string
  guestTeacherId?: string
}

export interface CreateDocumentRequest {
  sessionId?: string
  title: string
  fileUrl: string
  fileType: string
  fileSizeKb: number
}

export interface CreateAssignmentRequest {
  title: string
  description: string
  dueDate?: string
  assignmentType?: 'Upload' | 'Quiz'
  allowLateSubmission?: boolean
  questionsJson?: string
}

export interface UpdateAssignmentRequest {
  title?: string
  description?: string
  dueDate?: string | null
  assignmentType?: 'Upload' | 'Quiz'
  allowLateSubmission?: boolean
  questionsJson?: string
}

export interface SubmitAssignmentRequest {
  submissionText?: string
  fileUrl?: string
  fileName?: string
  answersJson?: string
}

export interface GradeSubmissionRequest {
  grade: number
  teacherFeedback?: string
  answersJson?: string
}

export interface AnnouncementComment {
  id: string
  announcementId: string
  content: string
  createdBy: string
  creatorName: string
  creatorRole: string
  createdAt: string
  parentCommentId?: string | null
}

export interface ClassAnnouncement {
  id: string
  classId: string
  content: string
  createdBy: string
  creatorName: string
  creatorRole: string
  createdAt: string
  comments: AnnouncementComment[]
}

