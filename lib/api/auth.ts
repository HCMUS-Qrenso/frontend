import { apiClient } from '@/lib/axios'
import type {
  ApiErrorResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  ResetPasswordPayload,
  SignupPayload,
  VerifyEmailPayload,
  User,
} from '@/types/auth'

export const authApi = {
  login: async (payload: LoginCredentials): Promise<AuthResponse> => {
    // Tách rememberMe ra khỏi payload vì backend không cần
    const { rememberMe, ...loginPayload } = payload
    const { data } = await apiClient.post<AuthResponse>('/auth/login', loginPayload)
    return data
  },

  signup: async (payload: SignupPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/auth/signup', payload)
    return data
  },

  logout: async (): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/auth/logout')
    return data
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh')
    return data
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password', payload)
    return data
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/auth/reset-password', payload)
    return data
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/auth/verify-email', payload)
    return data
  },

  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}

export type { ApiErrorResponse }
