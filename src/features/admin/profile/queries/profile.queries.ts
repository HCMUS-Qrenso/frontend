import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'
import { usersQueryKeys } from '@/src/features/auth/hooks'
import { authQueryKeys } from '@/src/features/auth/queries/auth.queries'
import type { UpdateProfilePayload, UpdateProfileResponse } from '../types'

// Re-export the profile query from auth feature
export { useUserProfileQuery as useProfileQuery } from '@/src/features/auth/hooks'

// Update profile mutation
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      // Invalidate both auth and users profile queries
      queryClient.invalidateQueries({ queryKey: authQueryKeys.profile })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.profile })
    },
  })
}
