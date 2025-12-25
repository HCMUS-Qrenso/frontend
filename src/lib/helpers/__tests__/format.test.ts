/**
 * Format Helpers Unit Tests
 *
 * Tests for date and price formatting utilities.
 */

import { formatRelativeDate, formatPrice, formatDateTime, formatShortDate } from '../format'

describe('formatRelativeDate', () => {
  it('should return "Vừa xong" for dates less than 1 hour ago', () => {
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

    expect(formatRelativeDate(thirtyMinutesAgo.toISOString())).toBe('Vừa xong')
  })

  it('should return "Xh trước" for dates within 24 hours', () => {
    const now = new Date()
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000)

    expect(formatRelativeDate(fiveHoursAgo.toISOString())).toBe('5h trước')
  })

  it('should return "1 ngày trước" for dates between 24 and 48 hours ago', () => {
    const now = new Date()
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000)

    expect(formatRelativeDate(thirtyHoursAgo.toISOString())).toBe('1 ngày trước')
  })

  it('should return localized date for dates older than 48 hours', () => {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const result = formatRelativeDate(threeDaysAgo.toISOString())
    // Should be in Vietnamese date format (dd/MM/yyyy)
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
  })
})

describe('formatPrice', () => {
  it('should format number price in VND', () => {
    const result = formatPrice(100000)
    expect(result).toContain('100.000')
    expect(result).toContain('₫')
  })

  it('should format string price in VND', () => {
    const result = formatPrice('50000')
    expect(result).toContain('50.000')
  })

  it('should format price with different currency', () => {
    const result = formatPrice(100, 'USD')
    expect(result).toContain('100')
    expect(result).toContain('$')
  })

  it('should handle decimal prices', () => {
    const result = formatPrice(99.99, 'USD')
    expect(result).toContain('$')
  })
})

describe('formatDateTime', () => {
  it('should return "—" for null input', () => {
    expect(formatDateTime(null)).toBe('—')
  })

  it('should format valid date string', () => {
    const result = formatDateTime('2024-12-24T10:30:00Z')
    // Should contain date parts
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    // Should contain time parts
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('formatShortDate', () => {
  it('should format date to Vietnamese short format', () => {
    const result = formatShortDate('2024-12-24T10:30:00Z')
    // Should be in dd/MM/yyyy format
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
  })
})
