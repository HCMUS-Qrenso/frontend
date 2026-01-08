/**
 * Price Calculator Unit Tests
 *
 * Comprehensive tests for tax and service charge calculations
 */

import { calculateOrderTotal, type OrderItem } from '../price-calculator'

describe('Price Calculator - Tax Exclusive', () => {
  const items: OrderItem[] = [{ price: 100000, quantity: 1 }]

  it('should calculate tax exclusive with no service charge', () => {
    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: false, label: 'VAT' },
      { enabled: false, rate: 5, taxable: false, min_party: null },
    )

    expect(result.subtotal).toBe(100000)
    expect(result.serviceCharge).toBe(0)
    expect(result.taxAmount).toBe(10000)
    expect(result.total).toBe(110000)
  })

  it('should calculate with service charge non-taxable', () => {
    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: false, label: 'VAT' },
      { enabled: true, rate: 5, taxable: false, min_party: null },
    )

    expect(result.subtotal).toBe(100000)
    expect(result.serviceCharge).toBe(5000)
    expect(result.taxAmount).toBe(10000) // Tax only on subtotal
    expect(result.total).toBe(115000)
  })

  it('should calculate with service charge taxable', () => {
    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: false, label: 'VAT' },
      { enabled: true, rate: 5, taxable: true, min_party: null },
    )

    expect(result.subtotal).toBe(100000)
    expect(result.serviceCharge).toBe(5000)
    expect(result.taxableAmount).toBe(105000)
    expect(result.taxAmount).toBe(10500) // Tax on subtotal + service charge
    expect(result.total).toBe(115500)
  })
})

describe('Price Calculator - Tax Inclusive', () => {
  const items: OrderItem[] = [{ price: 110000, quantity: 1 }] // Price includes 10% tax

  it('should reverse calculate tax from inclusive price', () => {
    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: true, label: 'VAT' },
      { enabled: false, rate: 5, taxable: false, min_party: null },
    )

    expect(result.subtotal).toBe(100000) // Reversed from 110000
    expect(result.serviceCharge).toBe(0)
    expect(result.taxAmount).toBe(10000)
    expect(result.total).toBe(110000)
  })

  it('should calculate with service charge on reversed subtotal', () => {
    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: true, label: 'VAT' },
      { enabled: true, rate: 5, taxable: false, min_party: null },
    )

    expect(result.subtotal).toBe(100000)
    expect(result.serviceCharge).toBe(5000) // 5% of subtotal
    expect(result.taxAmount).toBe(10000) // Tax from original inclusive price
    expect(result.total).toBe(115000)
  })

  it('should calculate with taxable service charge', () => {
    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: true, label: 'VAT' },
      { enabled: true, rate: 5, taxable: true, min_party: null },
    )

    expect(result.subtotal).toBe(100000)
    expect(result.serviceCharge).toBe(5000)
    expect(result.taxAmount).toBe(10500) // Tax on subtotal + service charge
    expect(result.total).toBe(115500)
  })
})

describe('Price Calculator - Service Charge with min_party', () => {
  const items: OrderItem[] = [{ price: 100000, quantity: 1 }]
  const taxSettings = { rate: 10, inclusive: false, label: 'VAT' }

  it('should not apply service charge when party size below minimum', () => {
    const result = calculateOrderTotal(
      items,
      taxSettings,
      { enabled: true, rate: 5, taxable: false, min_party: 4 },
      3, // Party size < min_party
    )

    expect(result.serviceCharge).toBe(0)
    expect(result.breakdown.showServiceCharge).toBe(false)
    expect(result.total).toBe(110000) // Only subtotal + tax
  })

  it('should apply service charge when party size meets minimum', () => {
    const result = calculateOrderTotal(
      items,
      taxSettings,
      { enabled: true, rate: 5, taxable: false, min_party: 4 },
      4, // Party size = min_party
    )

    expect(result.serviceCharge).toBe(5000)
    expect(result.breakdown.showServiceCharge).toBe(true)
    expect(result.total).toBe(115000)
  })

  it('should apply service charge when party size exceeds minimum', () => {
    const result = calculateOrderTotal(
      items,
      taxSettings,
      { enabled: true, rate: 5, taxable: false, min_party: 4 },
      6, // Party size > min_party
    )

    expect(result.serviceCharge).toBe(5000)
    expect(result.breakdown.showServiceCharge).toBe(true)
  })

  it('should apply service charge when min_party is null', () => {
    const result = calculateOrderTotal(
      items,
      taxSettings,
      { enabled: true, rate: 5, taxable: false, min_party: null },
      2, // Any party size
    )

    expect(result.serviceCharge).toBe(5000)
    expect(result.breakdown.showServiceCharge).toBe(true)
  })
})

describe('Price Calculator - Multiple Items', () => {
  it('should correctly calculate for multiple items', () => {
    const items: OrderItem[] = [
      { price: 50000, quantity: 2 }, // 100,000
      { price: 75000, quantity: 1 }, // 75,000
    ]

    const result = calculateOrderTotal(
      items,
      { rate: 10, inclusive: false, label: 'VAT' },
      { enabled: true, rate: 5, taxable: true, min_party: null },
    )

    expect(result.subtotal).toBe(175000)
    expect(result.serviceCharge).toBe(8750)
    expect(result.taxAmount).toBe(18375)
    expect(result.total).toBe(202125)
  })
})

describe('Price Calculator - Edge Cases', () => {
  it('should handle empty items array', () => {
    const result = calculateOrderTotal(
      [],
      { rate: 10, inclusive: false, label: 'VAT' },
      { enabled: true, rate: 5, taxable: false, min_party: null },
    )

    expect(result.subtotal).toBe(0)
    expect(result.total).toBe(0)
  })

  it('should handle 0% tax rate', () => {
    const result = calculateOrderTotal(
      [{ price: 100000, quantity: 1 }],
      { rate: 0, inclusive: false, label: 'No Tax' },
      { enabled: false, rate: 5, taxable: false, min_party: null },
    )

    expect(result.taxAmount).toBe(0)
    expect(result.total).toBe(100000)
  })

  it('should handle 0% service charge rate', () => {
    const result = calculateOrderTotal(
      [{ price: 100000, quantity: 1 }],
      { rate: 10, inclusive: false, label: 'VAT' },
      { enabled: true, rate: 0, taxable: false, min_party: null },
    )

    expect(result.serviceCharge).toBe(0)
    expect(result.total).toBe(110000)
  })

  it('should use defaults when settings not provided', () => {
    const result = calculateOrderTotal([{ price: 100000, quantity: 1 }])

    // Defaults: 10% tax exclusive, no service charge
    expect(result.taxAmount).toBe(10000)
    expect(result.serviceCharge).toBe(0)
    expect(result.total).toBe(110000)
  })
})

describe('Price Calculator - Breakdown Info', () => {
  it('should provide correct breakdown info', () => {
    const result = calculateOrderTotal(
      [{ price: 100000, quantity: 1 }],
      { rate: 10, inclusive: false, label: 'GST' },
      { enabled: true, rate: 5, taxable: false, min_party: null },
    )

    expect(result.breakdown.taxLabel).toBe('GST')
    expect(result.breakdown.isTaxInclusive).toBe(false)
    expect(result.breakdown.showServiceCharge).toBe(true)
    expect(result.breakdown.serviceChargeLabel).toContain('5%')
  })
})
