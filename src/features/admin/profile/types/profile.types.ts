// Profile Types

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl: string | null
  role: string
  tenantId: string | null
  emailVerified: boolean
  status: string
  createdAt: string
  lastLoginAt: string | null
  updatedAt: string
}

export interface UpdateProfilePayload {
  fullName?: string
  phone?: string
  avatarUrl?: string | null
}

export interface UpdateProfileResponse {
  success: boolean
  message: string
  data: UserProfile
}
