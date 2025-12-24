import { apiClient } from '@/src/lib/axios'
import type { UserProfile } from '@/src/features/auth/types/auth'

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/users/profile')
    return data
  },
}
