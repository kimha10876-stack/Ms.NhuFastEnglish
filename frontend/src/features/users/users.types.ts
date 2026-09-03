export interface UserListItem {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  roles: string[]
  isActive: boolean
  createdAt: string
  teacherType: string | null
  teachingClassCount: number
  studentLevel: string | null
  studentGoal: string | null
  enrolledClassCount: number
}

export interface UserFilterParams {
  role?: string
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface PaginatedUsersResponse {
  items: UserListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
