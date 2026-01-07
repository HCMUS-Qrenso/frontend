'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSettingsQuery } from '@/src/features/admin/settings/queries'

/**
 * Format settings extracted from tenant for use in formatting helpers
 */
export interface FormatSettings {
  currency: string
  currencySymbol: string
  timezone: string
  dateFormat: string
  language: string
  phone: string | null
  contactEmail: string | null
  // Order settings
  estimatedPrepTime: number
  // Tax settings
  tax: {
    rate: number
    inclusive: boolean
    label: string
  }
  // Service charge settings
  serviceCharge: {
    enabled: boolean
    rate: number
    taxable: boolean
    min_party: number | null
  }
}

/**
 * Default format settings when tenant data is unavailable
 */
export const DEFAULT_FORMAT_SETTINGS: FormatSettings = {
  currency: 'VND',
  currencySymbol: '₫',
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',
  language: 'vi',
  phone: null,
  contactEmail: null,
  estimatedPrepTime: 15,
  tax: {
    rate: 10,
    inclusive: false,
    label: 'VAT',
  },
  serviceCharge: {
    enabled: false,
    rate: 5,
    taxable: false,
    min_party: null,
  },
}

interface TenantSettingsContextValue {
  settings: FormatSettings
  isLoading: boolean
  isError: boolean
}

const TenantSettingsContext = createContext<TenantSettingsContextValue | null>(null)

interface TenantSettingsProviderProps {
  children: ReactNode
}

/**
 * Provider that fetches and shares tenant format settings across the admin panel.
 * Uses the settings query which calls /tenants/settings endpoint.
 */
export function TenantSettingsProvider({ children }: TenantSettingsProviderProps) {
  const { data, isLoading, isError } = useSettingsQuery()

  const settings = useMemo<FormatSettings>(() => {
    if (!data?.data) {
      return DEFAULT_FORMAT_SETTINGS
    }

    const tenantSettings = data.data
    return {
      currency: tenantSettings.general?.currency || DEFAULT_FORMAT_SETTINGS.currency,
      currencySymbol: tenantSettings.general?.currency_symbol || DEFAULT_FORMAT_SETTINGS.currencySymbol,
      timezone: tenantSettings.general?.timezone || DEFAULT_FORMAT_SETTINGS.timezone,
      dateFormat: tenantSettings.general?.date_format || DEFAULT_FORMAT_SETTINGS.dateFormat,
      language: tenantSettings.general?.language || DEFAULT_FORMAT_SETTINGS.language,
      phone: tenantSettings.general?.phone || null,
      contactEmail: tenantSettings.general?.contact_email || null,
      estimatedPrepTime: tenantSettings.order?.estimated_prep_time ?? DEFAULT_FORMAT_SETTINGS.estimatedPrepTime,
      tax: {
        rate: tenantSettings.tax?.rate ?? DEFAULT_FORMAT_SETTINGS.tax.rate,
        inclusive: tenantSettings.tax?.inclusive ?? DEFAULT_FORMAT_SETTINGS.tax.inclusive,
        label: tenantSettings.tax?.label || DEFAULT_FORMAT_SETTINGS.tax.label,
      },
      serviceCharge: {
        enabled: tenantSettings.service_charge?.enabled ?? DEFAULT_FORMAT_SETTINGS.serviceCharge.enabled,
        rate: tenantSettings.service_charge?.rate ?? DEFAULT_FORMAT_SETTINGS.serviceCharge.rate,
        taxable: tenantSettings.service_charge?.taxable ?? DEFAULT_FORMAT_SETTINGS.serviceCharge.taxable,
        min_party: tenantSettings.service_charge?.min_party ?? null,
      },
    }
  }, [data])

  const value = useMemo<TenantSettingsContextValue>(
    () => ({ settings, isLoading, isError }),
    [settings, isLoading, isError],
  )

  return (
    <TenantSettingsContext.Provider value={value}>
      {children}
    </TenantSettingsContext.Provider>
  )
}

/**
 * Hook to access tenant format settings.
 * Returns default settings if used outside of TenantSettingsProvider.
 */
export function useTenantSettings(): TenantSettingsContextValue {
  const context = useContext(TenantSettingsContext)

  if (!context) {
    // Return defaults if outside provider (e.g., public pages)
    return {
      settings: DEFAULT_FORMAT_SETTINGS,
      isLoading: false,
      isError: false,
    }
  }

  return context
}

