/**
 * Shared Utils Unit Tests
 *
 * Tests for admin shared utility functions.
 */

import { getInitials } from '../utils'

describe('getInitials', () => {
  it('should return two initials for full name with two words', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('should return two initials for full name with multiple words', () => {
    expect(getInitials('John Michael Doe')).toBe('JD')
  })

  it('should return single initial for single name', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('should return empty string for empty input', () => {
    expect(getInitials('')).toBe('')
  })

  it('should handle names with extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD')
  })

  it('should return uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('should handle Vietnamese names', () => {
    expect(getInitials('Nguyễn Văn An')).toBe('NA')
  })

  it('should handle single character name', () => {
    expect(getInitials('A')).toBe('A')
  })
})
