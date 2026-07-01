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
