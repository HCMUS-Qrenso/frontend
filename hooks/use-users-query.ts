import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/users'
import type { UserProfile } from '@/types/auth'

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
