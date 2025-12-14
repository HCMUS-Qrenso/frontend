import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  ResetPasswordPayload,
  SignupPayload,
  User,
  VerifyEmailPayload,
} from '@/types/auth'

export const authQueryKeys = {
  profile: ['auth', 'me'] as const,
}

export const useProfileQuery = (enabled = true) => {
  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: async () => {
      const data = await authApi.getProfile()
      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation<AuthResponse, unknown, LoginCredentials>({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data)
      queryClient.setQueryData<User>(authQueryKeys.profile, data.user)
    },
  })
}

export const useSignupMutation = () => {
  return useMutation<MessageResponse, unknown, SignupPayload>({
    mutationFn: (payload) => authApi.signup(payload),
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return useMutation<MessageResponse>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth()
      queryClient.removeQueries({ queryKey: authQueryKeys.profile })
    },
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation<MessageResponse, unknown, ForgotPasswordPayload>({
    mutationFn: (payload) => authApi.forgotPassword(payload),
  })
}

export const useResetPasswordMutation = () => {
  return useMutation<MessageResponse, unknown, ResetPasswordPayload>({
    mutationFn: (payload) => authApi.resetPassword(payload),
  })
}

export const useVerifyEmailMutation = () => {
  return useMutation<MessageResponse, unknown, VerifyEmailPayload>({
    mutationFn: (payload) => authApi.verifyEmail(payload),
  })
}
