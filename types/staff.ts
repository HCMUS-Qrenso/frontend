// Staff Types for Frontend

// Staff entity (matches backend response - camelCase)
export interface Staff {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  role: 'waiter' | 'kitchen_staff'
  tenantId: string
  emailVerified: boolean
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

// Query params for GET /staff
export interface StaffQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: 'waiter' | 'kitchen_staff'
  status?: 'active' | 'inactive' | 'suspended'
  emailVerified?: boolean
  sortBy?: 'createdAt' | 'fullName' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
}

// API Response for GET /staff
export interface StaffListResponse {
  items: Staff[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// API Response for GET /staff/stats
export interface StaffRoleStats {
  total: number
  active: number
  inactive: number
  suspended: number
}

export interface StaffStatsResponse {
  total: number
  byRole: {
    waiter: StaffRoleStats
    kitchen_staff: StaffRoleStats
  }
  summary: {
    active: number
    inactive: number
    suspended: number
  }
}

// Payload for POST /staff (create/invite)
export interface CreateStaffPayload {
  fullName: string
  email: string
  phone?: string
  role: 'waiter' | 'kitchen_staff'
}

// Payload for PUT /staff/:id (update)
export interface UpdateStaffPayload {
  fullName?: string
  phone?: string
  status?: 'active' | 'inactive' | 'suspended'
}

// Payload for PATCH /staff/:id/status
export interface UpdateStatusPayload {
  status: 'active' | 'inactive' | 'suspended'
}

// Single staff response type
export type StaffResponse = Staff
