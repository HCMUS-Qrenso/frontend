import { apiClient } from '@/src/lib/axios'
import type { UpdateProfilePayload, UpdateProfileResponse } from '../types'

// API functions
export const profileApi = {
  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>('/users/profile', data)
    return response.data
  },
}
