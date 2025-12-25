/**
 * Table Utils Unit Tests
 *
 * Tests for table utility functions.
 */

import { formatRotation } from '../table-utils'

describe('formatRotation', () => {
  it('should round to 2 decimal places', () => {
    expect(formatRotation(143.05295863147188)).toBe(143.05)
  })

  it('should keep whole numbers as-is', () => {
    expect(formatRotation(90)).toBe(90)
  })

  it('should handle 0', () => {
    expect(formatRotation(0)).toBe(0)
  })

  it('should handle negative rotation', () => {
    expect(formatRotation(-45.5678)).toBe(-45.57)
  })

  it('should round 0.5 up', () => {
    expect(formatRotation(90.005)).toBe(90.01)
  })

  it('should handle 360 degrees', () => {
    expect(formatRotation(360)).toBe(360)
  })

  it('should handle small decimals', () => {
    expect(formatRotation(0.001)).toBe(0)
  })

  it('should handle very precise numbers', () => {
    expect(formatRotation(45.999999)).toBe(46)
  })
})
