import { apiClient } from '@/src/lib/axios'
import type {
  ApiErrorResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  ResetPasswordPayload,
  SetupPasswordPayload,
  SignupPayload,
  VerifyEmailPayload,
  User,
} from '@/src/features/auth/types'

export const authApi = {
  login: async (payload: LoginCredentials): Promise<AuthResponse> => {
    // Gửi toàn bộ payload bao gồm rememberMe lên backend
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
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

  setupPassword: async (payload: SetupPasswordPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/auth/setup-password', payload)
    return data
  },
}

export type { ApiErrorResponse }
