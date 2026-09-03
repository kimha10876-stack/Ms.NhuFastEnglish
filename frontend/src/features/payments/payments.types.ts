export interface CreatePaymentRequest {
  classId?: string
  paymentType?: 'TuitionMonthly' | 'ClassEnrollment' | 'CoursePackage'
  paymentMethod?: 'PayOS' | 'VNPAY' | 'Cash'
  billingMonth?: number
  billingYear?: number
  customAmount?: number
  description?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface PaymentResponse {
  id: string
  orderCode: number
  paymentCode: string
  userId: string
  userFullName: string
  userEmail: string
  classId?: string | null
  className?: string | null
  amount: number
  discountAmount: number
  finalAmount: number
  currency: string
  paymentType: string
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled' | 'Expired' | 'Refunded'
  paymentMethod: string
  billingMonth?: number | null
  billingYear?: number | null
  description: string
  checkoutUrl?: string | null
  qrCode?: string | null
  expiresAt?: string | null
  completedAt?: string | null
  createdAt: string
}

export interface PaymentTransaction {
  id: string
  paymentId: string
  transactionReference?: string | null
  gateway: string
  amount: number
  status: string
  note?: string | null
  paidAt?: string | null
  createdAt: string
}

export interface PaymentDetail extends PaymentResponse {
  confirmedBy?: string | null
  note?: string | null
  transactions: PaymentTransaction[]
}

export interface PaymentStatus {
  id: string
  orderCode: number
  status: string
  isCompleted: boolean
  isPending: boolean
  isFailed: boolean
  completedAt?: string | null
  message?: string | null
}

export interface PaginatedList<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminPaymentFilter {
  status?: string
  paymentMethod?: string
  paymentType?: string
  classId?: string
  search?: string
  page?: number
  pageSize?: number
}
