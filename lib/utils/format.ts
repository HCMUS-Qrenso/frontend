/**
 * Shared format utilities for consistent data formatting across admin panel
 */

/**
 * Format date to Vietnamese relative time
 * @param dateString - ISO date string
 * @returns Relative time string in Vietnamese
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return 'Vừa xong'
  } else if (diffInHours < 24) {
    return `${diffInHours}h trước`
  } else if (diffInHours < 48) {
    return '1 ngày trước'
  } else {
    return date.toLocaleDateString('vi-VN')
  }
}

/**
 * Format price to Vietnamese currency format
 * @param price - Price value (string or number)
 * @param currency - Currency code (default: VND)
 * @returns Formatted currency string
 */
export function formatPrice(price: string | number, currency: string = 'VND'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(numPrice)
}

/**
 * Format date to Vietnamese locale string
 * @param dateString - ISO date string or null
 * @returns Formatted date string or fallback
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date to short Vietnamese format (dd/MM/yy)
 * @param dateString - ISO date string
 * @returns Short date string
 */
export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN')
}
