export interface StudentClass {
  classId: string
  className: string
  categoryName: string
  categoryColorHex: string
  teacherName: string
  status: string
  joinedAt: string
}

export interface StudentDetail {
  studentId: string
  fullName: string
  email: string
  phone: string | null
  parentPhone?: string | null
  dateOfBirth?: string | null
  level: string
  goal: string
  status: string
  isActive: boolean
  createdAt: string
  classes: StudentClass[]
}

export interface CreateStudentRequest {
  fullName: string
  email: string
  passwordHash?: string // password
  password?: string
  phone?: string
  parentPhone?: string
  dateOfBirth?: string
  level: string
  goal: string
  status: string
}

export interface UpdateStudentRequest {
  fullName?: string
  email?: string
  password?: string
  phone?: string
  parentPhone?: string
  dateOfBirth?: string
  level?: string
  goal?: string
  status?: string
  isActive?: boolean
}
