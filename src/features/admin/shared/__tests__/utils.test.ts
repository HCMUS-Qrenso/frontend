/**
 * Shared Utils Unit Tests
 *
 * Tests for admin shared utility functions.
 */

import { getInitials, getRoleLabel } from '../utils'

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

describe('getRoleLabel', () => {
  it('should return Vietnamese label for owner', () => {
    expect(getRoleLabel('owner')).toBe('Chủ nhà hàng')
  })

  it('should return Vietnamese label for admin', () => {
    expect(getRoleLabel('admin')).toBe('Quản trị viên')
  })

  it('should return Vietnamese label for manager', () => {
    expect(getRoleLabel('manager')).toBe('Quản lý')
  })

  it('should return Vietnamese label for waiter', () => {
    expect(getRoleLabel('waiter')).toBe('Nhân viên phục vụ')
  })

  it('should return Vietnamese label for chef', () => {
    expect(getRoleLabel('chef')).toBe('Đầu bếp')
  })

  it('should return Vietnamese label for customer', () => {
    expect(getRoleLabel('customer')).toBe('Khách hàng')
  })

  it('should handle uppercase role', () => {
    expect(getRoleLabel('OWNER')).toBe('Chủ nhà hàng')
  })

  it('should handle mixed case role', () => {
    expect(getRoleLabel('Waiter')).toBe('Nhân viên phục vụ')
  })

  it('should return original role for unknown role', () => {
    expect(getRoleLabel('unknown_role')).toBe('unknown_role')
  })
})
