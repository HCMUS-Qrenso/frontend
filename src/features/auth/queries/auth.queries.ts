import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/src/features/auth/api'
import { usersApi } from '@/src/features/auth/api'
import { tenantsApi } from '@/src/features/admin/tenants/api/tenants.api'
import { useAuthStore } from '@/src/store/auth-store'
import { useTenantStore } from '@/src/store/tenant-store'
import { usersQueryKeys } from '@/src/features/auth/hooks'
import { tenantsQueryKeys } from '@/src/features/admin/tenants/queries/tenants.queries'
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  ResetPasswordPayload,
  SignupPayload,
  User,
  VerifyEmailPayload,
} from '@/src/features/auth/types'

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
  const tenantStore = useTenantStore.getState()

  return useMutation<AuthResponse, unknown, LoginCredentials>({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: async (data, variables) => {
      // Truyền rememberMe vào setAuth (mặc định true nếu không có)
      setAuth(data, variables.rememberMe ?? true)

      // Set initial user data from login response
      queryClient.setQueryData<User>(authQueryKeys.profile, data.user)

      // Invalidate và prefetch /auth/me để đảm bảo luôn được gọi sau login
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.profile })
      await queryClient.prefetchQuery({
        queryKey: authQueryKeys.profile,
        queryFn: async () => {
          const profileData = await authApi.getProfile()
          return profileData
        },
      })

      // Invalidate và prefetch /users/profile để đảm bảo luôn được gọi sau login
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.profile })
      await queryClient.prefetchQuery({
        queryKey: usersQueryKeys.profile,
        queryFn: () => usersApi.getProfile(),
      })

      // Nếu là owner: sau login gọi luôn /tenants và /tenants/current
      if (data.user.role === 'owner') {
        try {
          // 1) Lấy danh sách tenants mà owner sở hữu
          const tenantsRes = await tenantsApi.getOwnerTenants({
            status: 'active',
            limit: 50,
          })

          const tenants = tenantsRes.data.tenants
          if (tenants.length > 0) {
            // 2) Lưu vào tenant-store
            tenantStore.setTenants(tenants)

            // 3) Auto chọn tenant đầu tiên => set selectedTenantId + x-tenant-id
            const firstTenantId = tenants[0].id
            tenantStore.selectTenant(firstTenantId)

            // 4) Gọi tiếp /tenants/current để lấy chi tiết tenant đang chọn
            await tenantsApi.getCurrentTenant()
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            // Không chặn flow login nếu tenants API lỗi, chỉ log ra cho dev
            // eslint-disable-next-line no-console
            console.error('[useLoginMutation] Failed to prefetch tenants for owner:', error)
          }
        }
      } else {
        // Non-owner (admin/staff): sau login prefetch /tenants/current để có thông tin tenant
        try {
          await queryClient.invalidateQueries({ queryKey: tenantsQueryKeys.current() })
          await queryClient.prefetchQuery({
            queryKey: tenantsQueryKeys.current(),
            queryFn: () => tenantsApi.getCurrentTenant(),
          })
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('[useLoginMutation] Failed to prefetch current tenant:', error)
          }
        }
      }
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
