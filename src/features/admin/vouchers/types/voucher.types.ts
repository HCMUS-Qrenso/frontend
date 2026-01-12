// Voucher Types
export type VoucherStatus = 'draft' | 'active' | 'paused' | 'archived'
export type VoucherKind = 'automatic' | 'staff_only' | 'code'
export type DiscountType = 'percent' | 'fixed_amount'
export type ApplySource = 'auto' | 'waiter' | 'customer_code' | 'admin'

export interface Voucher {
  id: string
  code: string
  name: string
  description: string | null
  status: VoucherStatus
  kind: VoucherKind
  discountType: DiscountType
  percentOff: number | null
  amountOff: number | null
  maxDiscountAmount: number | null
  minSubtotal: number | null
  minParty: number | null
  startsAt: string | null
  endsAt: string | null
  maxRedemptionsTotal: number | null
  maxRedemptionsPerCustomer: number | null
  autoApply: boolean
  isPublic: boolean
  stackable: boolean
  priority: number
  redemptionCount: number
  codeCount: number
  createdAt: string
  updatedAt: string
}

export interface VoucherRedemption {
  id: string
  orderId: string
  orderNumber: string
  orderTotal: number
  discountAmount: number
  source: ApplySource
  notes: string | null
  revokedAt: string | null
  revokeReason: string | null
  createdAt: string
}

export interface VoucherQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: VoucherStatus
  kind?: VoucherKind
  autoApply?: boolean
  isPublic?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface VoucherListResponse {
  success: boolean
  data: Voucher[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface VoucherResponse {
  success: boolean
  data: Voucher
}

export interface RedemptionListResponse {
  success: boolean
  data: VoucherRedemption[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateVoucherPayload {
  code: string
  name: string
  description?: string
  kind: VoucherKind
  discountType: DiscountType
  percentOff?: number
  amountOff?: number
  maxDiscountAmount?: number
  minSubtotal?: number
  minParty?: number
  startsAt?: string
  endsAt?: string
  maxRedemptionsTotal?: number
  maxRedemptionsPerCustomer?: number
  autoApply?: boolean
  isPublic?: boolean
  priority?: number
  status?: VoucherStatus
}

export interface UpdateVoucherPayload extends Partial<CreateVoucherPayload> {
  status?: VoucherStatus
}
