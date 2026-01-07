/**
 * Shared format utilities for consistent data formatting across admin panel.
 * All functions accept optional settings to override defaults.
 */

// ============================================
// TYPES
// ============================================

export interface PriceFormatOptions {
  /** Currency code (ISO 4217), e.g., 'VND', 'USD' */
  currency?: string
  /** Currency symbol to display, e.g., '₫', '$' */
  symbol?: string
  /** Locale for number formatting, e.g., 'vi-VN', 'en-US' */
  locale?: string
}

export interface DateFormatOptions {
  /** Locale for date formatting, e.g., 'vi-VN', 'en-US' */
  locale?: string
  /** IANA timezone, e.g., 'Asia/Ho_Chi_Minh' */
  timezone?: string
  /** Include time in output */
  includeTime?: boolean
  /** Date format pattern: 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD' */
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
}

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_CURRENCY = 'VND'
const DEFAULT_LOCALE = 'vi-VN'
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh'

/**
 * Maps language code to Intl locale
 */
export function languageToLocale(language: string): string {
  const localeMap: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
    zh: 'zh-CN',
    fr: 'fr-FR',
  }
  return localeMap[language] || DEFAULT_LOCALE
}

// ============================================
// FORMAT FUNCTIONS
// ============================================

/**
 * Format price with currency symbol.
 * Uses simple number formatting + symbol for consistent display across locales.
 * @param price - Price value (string or number)
 * @param options - Optional format settings
 * @returns Formatted price string with symbol
 *
 * @example
 * formatPrice(100000) // "100.000 ₫"
 * formatPrice(100, { currency: 'USD', symbol: '$' }) // "100 $"
 */
export function formatPrice(
  price: string | number,
  options?: PriceFormatOptions,
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return '—'
  }

  const locale = options?.locale || DEFAULT_LOCALE
  const symbol = options?.symbol || '₫'

  // Use simple number format + symbol suffix for consistency
  // This avoids Intl.NumberFormat currency style which shows "US$" for USD in vi-VN locale
  const formattedNumber = numPrice.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return `${formattedNumber} ${symbol}`
}

/**
 * Format date and time with locale, timezone, and custom date format support.
 * @param dateString - ISO date string or null
 * @param options - Optional format settings
 * @returns Formatted date/time string or '—' if null
 *
 * @example
 * formatDateTime('2024-12-24T10:30:00Z') // "24/12/2024, 17:30"
 * formatDateTime('2024-12-24T10:30:00Z', { dateFormat: 'YYYY-MM-DD' }) // "2024-12-24, 17:30"
 */
export function formatDateTime(
  dateString: string | null,
  options?: DateFormatOptions,
): string {
  if (!dateString) return '—'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'

  const timezone = options?.timezone || DEFAULT_TIMEZONE
  const includeTime = options?.includeTime !== false // Default true
  const dateFormat = options?.dateFormat || 'DD/MM/YYYY'

  try {
    // Get date parts in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined,
      hour12: false,
      timeZone: timezone,
    })
    
    const parts = formatter.formatToParts(date)
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || ''
    
    const day = getPart('day')
    const month = getPart('month')
    const year = getPart('year')
    const hour = getPart('hour')
    const minute = getPart('minute')
    
    // Format date according to dateFormat setting
    let formattedDate: string
    switch (dateFormat) {
      case 'MM/DD/YYYY':
        formattedDate = `${month}/${day}/${year}`
        break
      case 'YYYY-MM-DD':
        formattedDate = `${year}-${month}-${day}`
        break
      case 'DD/MM/YYYY':
      default:
        formattedDate = `${day}/${month}/${year}`
        break
    }
    
    if (includeTime && hour && minute) {
      return `${formattedDate}, ${hour}:${minute}`
    }
    
    return formattedDate
  } catch {
    // Fallback to simple format
    return date.toISOString().split('T')[0]
  }
}

/**
 * Format date without time (short format).
 * @param dateString - ISO date string
 * @param options - Optional format settings
 * @returns Short date string
 *
 * @example
 * formatShortDate('2024-12-24T10:30:00Z') // "24/12/2024"
 */
export function formatShortDate(
  dateString: string,
  options?: DateFormatOptions,
): string {
  return formatDateTime(dateString, { ...options, includeTime: false })
}

/**
 * Format time only (no date) with timezone support.
 * @param dateString - ISO date string
 * @param options - Optional format settings
 * @returns Time string (HH:mm format)
 *
 * @example
 * formatTime('2024-12-24T10:30:00Z') // "17:30" (in Asia/Ho_Chi_Minh)
 */
export function formatTime(
  dateString: string,
  options?: DateFormatOptions,
): string {
  if (!dateString) return '—'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'

  const locale = options?.locale || DEFAULT_LOCALE
  const timezone = options?.timezone || DEFAULT_TIMEZONE

  try {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    })
  } catch {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

/**
 * Format date to relative time (e.g., "2h ago", "yesterday").
 * Supports multiple locales.
 * @param dateString - ISO date string
 * @param locale - Locale for output ('vi', 'en', etc.)
 * @returns Relative time string
 *
 * @example
 * formatRelativeDate('2024-12-24T10:30:00Z') // "2h trước"
 * formatRelativeDate('2024-12-24T10:30:00Z', 'en') // "2h ago"
 */
export function formatRelativeDate(
  dateString: string,
  locale: string = 'vi',
): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  const translations: Record<string, { justNow: string; hoursAgo: string; dayAgo: string }> = {
    vi: { justNow: 'Vừa xong', hoursAgo: 'h trước', dayAgo: '1 ngày trước' },
    en: { justNow: 'Just now', hoursAgo: 'h ago', dayAgo: '1 day ago' },
    zh: { justNow: '刚刚', hoursAgo: '小时前', dayAgo: '1天前' },
    fr: { justNow: "À l'instant", hoursAgo: 'h avant', dayAgo: 'Il y a 1 jour' },
  }

  const t = translations[locale] || translations.vi

  if (diffInHours < 1) {
    return t.justNow
  } else if (diffInHours < 24) {
    return `${diffInHours}${t.hoursAgo}`
  } else if (diffInHours < 48) {
    return t.dayAgo
  } else {
    return formatShortDate(dateString, { locale: languageToLocale(locale) })
  }
}

