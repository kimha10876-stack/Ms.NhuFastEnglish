export interface TeacherClass {
  classId: string
  className: string
  categoryName: string
  categoryColorHex: string
  status: string
  memberCount: number
}

export interface TeacherDetail {
  teacherId: string
  userId: string
  fullName: string
  email: string
  phone: string
  bio: string | null
  type: 'permanent' | 'guest'
  contractStart: string
  contractEnd: string | null
  isActive: boolean
  createdAt: string
  classes: TeacherClass[]
}

export interface CreateTeacherRequest {
  fullName: string
  email: string
  password?: string
  phone: string
  bio?: string
  type: 'permanent' | 'guest'
  contractStart?: string
  contractEnd?: string
}

export interface UpdateTeacherRequest {
  fullName?: string
  email?: string
  password?: string
  phone?: string
  bio?: string
  type?: 'permanent' | 'guest'
  contractStart?: string
  contractEnd?: string
  isActive?: boolean
}
