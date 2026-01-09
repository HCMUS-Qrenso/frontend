import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/src/lib/axios'
import { OnboardingResponse, OnboardingDraft } from '../types'

const ONBOARDING_KEY = ['onboarding']

// Get onboarding status and draft
export function useOnboardingQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEY,
    queryFn: async () => {
      const response = await apiClient.get<OnboardingResponse>('/tenants/onboarding')
      return response.data
    },
  })
}

// Save onboarding draft
export function useSaveOnboardingDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (draft: Partial<OnboardingDraft>) => {
      const response = await apiClient.patch('/tenants/onboarding', draft)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEY })
    },
  })
}

// Complete onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/tenants/onboarding/complete')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEY })
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
    },
  })
}
