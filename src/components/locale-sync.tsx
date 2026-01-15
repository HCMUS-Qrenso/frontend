'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { setCurrentLocale } from '@/src/lib/axios'
import type { Locale } from '@/src/i18n/config'

/**
 * Component that syncs the next-intl locale with the axios client
 * This ensures API requests include the correct Accept-Language header
 */
export function LocaleSync() {
  const locale = useLocale()

  useEffect(() => {
    // Sync locale to axios whenever it changes
    setCurrentLocale(locale as Locale)
  }, [locale])

  // This component doesn't render anything
  return null
}
