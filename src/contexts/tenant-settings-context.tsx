'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSettingsQuery } from '@/src/features/admin/settings/queries'
import type { TenantSettings } from '@/src/features/admin/settings/types'

/**
 * Extended settings interface with all tenant settings
 */
export interface ExtendedTenantSettings extends TenantSettings {
  // Keep for backward compatibility
  currencySymbol: string
  dateFormat: string
  contactEmail: string | null
  estimatedPrepTime: number
}

/**
 * @deprecated Use ExtendedTenantSettings instead
 * Kept for backward compatibility
 */
export type FormatSettings = ExtendedTenantSettings

/**
 * Default settings when tenant data is unavailable
 */
export const DEFAULT_SETTINGS: ExtendedTenantSettings = {
  id: '',
  name: '',
  address: null,
  image: null,
  general: {
    currency: 'VND',
    currency_symbol: '₫',
    timezone: 'Asia/Ho_Chi_Minh',
    date_format: 'DD/MM/YYYY',
    language: 'vi',
    phone: null,
    contact_email: null,
  },
  tax: {
    rate: 10,
    inclusive: false,
    label: 'VAT',
  },
  service_charge: {
    enabled: false,
    rate: 5,
    taxable: false,
    min_party: null,
  },
  operating_hours: null,
  order: {
    min_value: null,
    estimated_prep_time: 15,
    allow_special_instructions: true,
    session_timeout_minutes: 120,
    require_guest_count: false,
  },
  notifications: {
    sound_enabled: true,
    sound: 1,
    email_enabled: false,
    email: null,
  },
  receipt: {
    header: null,
    footer: null,
    invoice_prefix: 'INV',
  },
  qr_payment: {
    payos_api_key: null,
    payos_checksum_key: null,
    payos_client_id: null,
  },
  // Backward compatibility aliases
  currencySymbol: '₫',
  dateFormat: 'DD/MM/YYYY',
  contactEmail: null,
  estimatedPrepTime: 15,
}

/**
 * @deprecated Use DEFAULT_SETTINGS instead
 * Kept for backward compatibility
 */
export const DEFAULT_FORMAT_SETTINGS = DEFAULT_SETTINGS

interface TenantSettingsContextValue {
  settings: ExtendedTenantSettings
  isLoading: boolean
  isError: boolean
}

const TenantSettingsContext = createContext<TenantSettingsContextValue | null>(null)

interface TenantSettingsProviderProps {
  children: ReactNode
}

/**
 * Provider that fetches and shares full tenant settings across the admin panel.
 * Uses the settings query which calls /tenants/settings endpoint.
 */
export function TenantSettingsProvider({ children }: TenantSettingsProviderProps) {
  const { data, isLoading, isError } = useSettingsQuery()

  const settings = useMemo<ExtendedTenantSettings>(() => {
    if (!data?.data) {
      return DEFAULT_SETTINGS
    }

    const tenantSettings = data.data
    return {
      ...tenantSettings,
      // Add backward compatibility aliases
      currencySymbol: tenantSettings.general.currency_symbol,
      dateFormat: tenantSettings.general.date_format,
      contactEmail: tenantSettings.general.contact_email,
      estimatedPrepTime: tenantSettings.order.estimated_prep_time,
    }
  }, [data])

  const value = useMemo<TenantSettingsContextValue>(
    () => ({ settings, isLoading, isError }),
    [settings, isLoading, isError],
  )

  return <TenantSettingsContext.Provider value={value}>{children}</TenantSettingsContext.Provider>
}

/**
 * Hook to access full tenant settings.
 * Returns default settings if used outside of TenantSettingsProvider.
 */
export function useTenantSettings(): TenantSettingsContextValue {
  const context = useContext(TenantSettingsContext)

  if (!context) {
    // Return defaults if outside provider (e.g., public pages)
    return {
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      isError: false,
    }
  }

  return context
}
