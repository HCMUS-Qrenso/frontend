import { apiClient } from '@/lib/axios'
import type { UserProfile } from '@/types/auth'

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/users/profile')
    return data
  },
}

