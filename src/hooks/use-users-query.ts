import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/src/features/auth/api/users'
import type { UserProfile } from '@/src/features/auth/types/auth'

export const usersQueryKeys = {
  profile: ['users', 'profile'] as const,
}

export const useUserProfileQuery = (enabled = true) => {
  return useQuery({
    queryKey: usersQueryKeys.profile,
    queryFn: async () => {
      const data = await usersApi.getProfile()
      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
