export interface User {
  id: string
  email: string
  fullName: string
  role: string
  tenantId: string | null
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  role: string
  emailVerified: boolean
  status: string
  avatarUrl: string | null
  tenantId: string | null
  createdAt: string
  lastLoginAt: string | null
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupPayload {
  email: string
  password: string
  fullName: string
  phone?: string
  role?: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface VerifyEmailPayload {
  email: string
  token: string
}

export interface MessageResponse {
  message: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
}
