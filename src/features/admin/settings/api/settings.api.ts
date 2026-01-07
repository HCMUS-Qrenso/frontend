import { apiClient } from '@/src/lib/axios'
import type {
  TenantSettingsResponse,
  UpdateTenantSettingsPayload,
} from '../types'

const SETTINGS_ENDPOINT = '/tenants/settings'

/**
 * Fetch current tenant settings
 */
export async function getSettings(): Promise<TenantSettingsResponse> {
  const response = await apiClient.get<TenantSettingsResponse>(SETTINGS_ENDPOINT)
  return response.data
}

/**
 * Update tenant settings (partial update)
 */
export async function updateSettings(
  payload: UpdateTenantSettingsPayload,
): Promise<TenantSettingsResponse> {
  const response = await apiClient.patch<TenantSettingsResponse>(
    SETTINGS_ENDPOINT,
    payload,
  )
  return response.data
}

