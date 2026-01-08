'use client'

import { useCallback } from 'react'
import { useLocale } from 'next-intl'
import { useTenantSettings } from '@/src/contexts/tenant-settings-context'
import {
  formatPrice as baseFormatPrice,
  formatDateTime as baseFormatDateTime,
  formatShortDate as baseFormatShortDate,
  formatTime as baseFormatTime,
  formatRelativeDate as baseFormatRelativeDate,
  languageToLocale,
  type PriceFormatOptions,
  type DateFormatOptions,
} from '@/src/lib/helpers/format'

/**
 * Hook that provides format functions pre-configured with tenant settings.
 * Automatically uses tenant currency, timezone, and language settings.
 * Falls back gracefully if settings are unavailable.
 *
 * @example
 * const { formatPrice, formatDateTime } = useFormat()
 * formatPrice(100000) // Uses tenant currency
 * formatDateTime('2024-12-24T10:30:00Z') // Uses tenant timezone & locale
 */
export function useFormat() {
  const { settings } = useTenantSettings()
  const urlLocale = useLocale() // From next-intl (URL-based locale)

  // Determine locale: URL locale takes precedence, then settings, then default
  const effectiveLocale = languageToLocale(urlLocale || settings.language)

  const formatPrice = useCallback(
    (price: string | number, options?: PriceFormatOptions) => {
      return baseFormatPrice(price, {
        currency: settings.currency,
        symbol: settings.currencySymbol,
        locale: effectiveLocale,
        ...options, // Allow overrides
      })
    },
    [settings.currency, settings.currencySymbol, effectiveLocale],
  )

  const formatDateTime = useCallback(
    (dateString: string | null, options?: DateFormatOptions) => {
      return baseFormatDateTime(dateString, {
        locale: effectiveLocale,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
        ...options, // Allow overrides
      })
    },
    [effectiveLocale, settings.timezone, settings.dateFormat],
  )

  const formatShortDate = useCallback(
    (dateString: string, options?: DateFormatOptions) => {
      return baseFormatShortDate(dateString, {
        locale: effectiveLocale,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
        ...options,
      })
    },
    [effectiveLocale, settings.timezone, settings.dateFormat],
  )

  const formatTime = useCallback(
    (dateString: string, options?: DateFormatOptions) => {
      return baseFormatTime(dateString, {
        locale: effectiveLocale,
        timezone: settings.timezone,
        ...options,
      })
    },
    [effectiveLocale, settings.timezone],
  )

  const formatRelativeDate = useCallback(
    (dateString: string) => {
      return baseFormatRelativeDate(dateString, urlLocale || settings.language)
    },
    [urlLocale, settings.language],
  )

  return {
    formatPrice,
    formatDateTime,
    formatShortDate,
    formatTime,
    formatRelativeDate,
    // Expose raw settings for components that need them directly
    settings,
  }
}
