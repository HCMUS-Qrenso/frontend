import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { settingsKeys } from './settings.keys'
import { getSettings, updateSettings } from '../api'
import type { UpdateTenantSettingsPayload } from '../types'

/**
 * Hook to fetch tenant settings
 */
export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to update tenant settings
 */
export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  const t = useTranslations('settings')

  return useMutation({
    mutationFn: (payload: UpdateTenantSettingsPayload) => updateSettings(payload),
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
      toast.success(t('saveSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('saveError'))
    },
  })
}
