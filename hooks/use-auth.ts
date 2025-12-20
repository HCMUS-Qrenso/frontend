'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import {
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
  useSignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} from '@/hooks/use-auth-query'
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  SignupPayload,
  VerifyEmailPayload,
} from '@/types/auth'

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isHydrated, authStatus, bootstrapAuth, setUser } =
    useAuthStore()

  useEffect(() => {
    bootstrapAuth()
  }, [bootstrapAuth])

  const profileQuery = useProfileQuery(isAuthenticated && isHydrated)
  useEffect(() => {
    if (profileQuery.data) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useAuth] ✅ /auth/me loaded:', profileQuery.data)
      }
      setUser(profileQuery.data)
    }
  }, [profileQuery.data, setUser])

  const loginMutation = useLoginMutation()
  const signupMutation = useSignupMutation()
  const logoutMutation = useLogoutMutation()
  const forgotPasswordMutation = useForgotPasswordMutation()
  const resetPasswordMutation = useResetPasswordMutation()
  const verifyEmailMutation = useVerifyEmailMutation()

  return {
    user,
    accessToken,
    isAuthenticated,
    isHydrated,
    authStatus,
    isLoadingProfile: profileQuery.isLoading || profileQuery.isFetching,
    login: (payload: LoginCredentials) => loginMutation.mutateAsync(payload),
    loginPending: loginMutation.isPending,
    signup: (payload: SignupPayload) => signupMutation.mutateAsync(payload),
    signupPending: signupMutation.isPending,
    logout: () => logoutMutation.mutateAsync(),
    logoutPending: logoutMutation.isPending,
    forgotPassword: (payload: ForgotPasswordPayload) => forgotPasswordMutation.mutateAsync(payload),
    forgotPasswordPending: forgotPasswordMutation.isPending,
    resetPassword: (payload: ResetPasswordPayload) => resetPasswordMutation.mutateAsync(payload),
    resetPasswordPending: resetPasswordMutation.isPending,
    verifyEmail: (payload: VerifyEmailPayload) => verifyEmailMutation.mutateAsync(payload),
    verifyEmailPending: verifyEmailMutation.isPending,
    profileQuery,
  }
}
