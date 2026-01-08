/**
 * Price Calculator
 *
 * Centralized price calculation logic for orders with tax and service charge.
 * Handles both tax-inclusive and tax-exclusive pricing, service charge with party size rules,
 * and proper tax application on service charges.
 */

// ============================================
// TYPES
// ============================================

export interface TaxSettings {
  /** Tax rate as percentage (e.g., 10 for 10%) */
  rate: number
  /** Whether prices already include tax */
  inclusive: boolean
  /** Display label for tax (e.g., "VAT", "GST") */
  label: string
}

export interface ServiceChargeSettings {
  /** Whether service charge is enabled */
  enabled: boolean
  /** Service charge rate as percentage (e.g., 5 for 5%) */
  rate: number
  /** Whether service charge is subject to tax */
  taxable: boolean
  /** Minimum party size to apply service charge (null = always apply) */
  min_party: number | null
}

export interface OrderItem {
  /** Unit price */
  price: number
  /** Quantity */
  quantity: number
}

export interface PriceBreakdown {
  /** Items subtotal (excluding tax and service charge) */
  subtotal: number
  /** Service charge amount */
  serviceCharge: number
  /** Amount subject to tax */
  taxableAmount: number
  /** Tax amount */
  taxAmount: number
  /** Final total */
  total: number
  /** UI display information */
  breakdown: {
    /** Whether to show service charge in breakdown */
    showServiceCharge: boolean
    /** Service charge label with percentage */
    serviceChargeLabel: string
    /** Tax label (from settings) */
    taxLabel: string
    /** Whether tax is inclusive */
    isTaxInclusive: boolean
  }
}

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_TAX_SETTINGS: TaxSettings = {
  rate: 10,
  inclusive: false,
  label: 'VAT',
}

const DEFAULT_SERVICE_CHARGE_SETTINGS: ServiceChargeSettings = {
  enabled: false,
  rate: 5,
  taxable: false,
  min_party: null,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate subtotal from items
 */
function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/**
 * Check if service charge should be applied based on party size
 */
function shouldApplyServiceCharge(settings: ServiceChargeSettings, partySize?: number): boolean {
  if (!settings.enabled) return false
  if (settings.min_party === null) return true
  if (partySize === undefined) return true // Apply if party size unknown
  return partySize >= settings.min_party
}

/**
 * Calculate tax amount for tax-exclusive pricing
 */
function calculateTaxExclusive(taxableAmount: number, taxRate: number): number {
  return (taxableAmount * taxRate) / 100
}

/**
 * Calculate tax amount for tax-inclusive pricing (reverse calculation)
 * Formula: taxAmount = total - (total / (1 + taxRate/100))
 */
function calculateTaxInclusive(totalAmount: number, taxRate: number): number {
  return totalAmount - totalAmount / (1 + taxRate / 100)
}

/**
 * Calculate subtotal from tax-inclusive total (reverse calculation)
 * Formula: subtotal = total / (1 + taxRate/100)
 */
function reverseCalculateSubtotal(totalAmount: number, taxRate: number): number {
  return totalAmount / (1 + taxRate / 100)
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate order total with tax and service charge
 *
 * @param items - Array of order items
 * @param taxSettings - Tax configuration (optional, uses defaults if not provided)
 * @param serviceChargeSettings - Service charge configuration (optional, uses defaults)
 * @param partySize - Number of guests (optional, needed for min_party rule)
 * @returns Complete price breakdown
 *
 * @example
 * // Tax exclusive + service charge taxable
 * const result = calculateOrderTotal(
 *   [{ price: 100000, quantity: 1 }],
 *   { rate: 10, inclusive: false, label: 'VAT' },
 *   { enabled: true, rate: 5, taxable: true, min_party: null }
 * )
 * // Result: { subtotal: 100000, serviceCharge: 5000, taxAmount: 10500, total: 115500 }
 *
 * @example
 * // Tax inclusive + service charge non-taxable
 * const result = calculateOrderTotal(
 *   [{ price: 110000, quantity: 1 }],
 *   { rate: 10, inclusive: true, label: 'VAT' },
 *   { enabled: true, rate: 5, taxable: false, min_party: null }
 * )
 * // Result: { subtotal: 100000, taxAmount: 10000, serviceCharge: 5000, total: 115000 }
 */
export function calculateOrderTotal(
  items: OrderItem[],
  taxSettings: TaxSettings = DEFAULT_TAX_SETTINGS,
  serviceChargeSettings: ServiceChargeSettings = DEFAULT_SERVICE_CHARGE_SETTINGS,
  partySize?: number,
): PriceBreakdown {
  // Validate inputs
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      serviceCharge: 0,
      taxableAmount: 0,
      taxAmount: 0,
      total: 0,
      breakdown: {
        showServiceCharge: false,
        serviceChargeLabel: `Service Charge (${serviceChargeSettings.rate}%)`,
        taxLabel: taxSettings.label,
        isTaxInclusive: taxSettings.inclusive,
      },
    }
  }

  const itemsTotal = calculateSubtotal(items)
  const applyServiceCharge = shouldApplyServiceCharge(serviceChargeSettings, partySize)

  let subtotal: number
  let taxAmount: number
  let serviceCharge: number
  let taxableAmount: number
  let total: number

  if (taxSettings.inclusive) {
    // TAX INCLUSIVE - Prices already include tax
    // Need to reverse-calculate the subtotal and extract tax

    // Step 1: Reverse calculate subtotal from tax-inclusive price
    subtotal = reverseCalculateSubtotal(itemsTotal, taxSettings.rate)

    // Step 2: Calculate service charge on subtotal
    serviceCharge = applyServiceCharge ? (subtotal * serviceChargeSettings.rate) / 100 : 0

    // Step 3: Calculate tax and taxable amount
    if (serviceChargeSettings.taxable && applyServiceCharge) {
      // Service charge is taxable - calculate tax on (subtotal + service charge)
      taxableAmount = subtotal + serviceCharge
      taxAmount = (taxableAmount * taxSettings.rate) / 100
    } else {
      // Service charge not taxable - calculate tax only on subtotal
      taxableAmount = subtotal
      taxAmount = calculateTaxInclusive(itemsTotal, taxSettings.rate)
    }

    // Step 4: Total
    total = subtotal + serviceCharge + taxAmount
  } else {
    // TAX EXCLUSIVE - Tax is added on top

    // Step 1: Subtotal is the items total
    subtotal = itemsTotal

    // Step 2: Calculate service charge on subtotal
    serviceCharge = applyServiceCharge ? (subtotal * serviceChargeSettings.rate) / 100 : 0

    // Step 3: Determine taxable amount
    if (serviceChargeSettings.taxable && applyServiceCharge) {
      // Service charge is taxable
      taxableAmount = subtotal + serviceCharge
    } else {
      // Service charge not taxable
      taxableAmount = subtotal
    }

    // Step 4: Calculate tax
    taxAmount = calculateTaxExclusive(taxableAmount, taxSettings.rate)

    // Step 5: Total
    total = subtotal + serviceCharge + taxAmount
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimals
    serviceCharge: Math.round(serviceCharge * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown: {
      showServiceCharge: applyServiceCharge,
      serviceChargeLabel: `Service Charge (${serviceChargeSettings.rate}%)`,
      taxLabel: taxSettings.label,
      isTaxInclusive: taxSettings.inclusive,
    },
  }
}

/**
 * Format price breakdown for display
 * Helper to easily render breakdown in UI components
 */
export function formatPriceBreakdown(
  breakdown: PriceBreakdown,
  formatPrice: (amount: number) => string,
): {
  subtotal: { label: string; amount: string }
  serviceCharge?: { label: string; amount: string }
  tax: { label: string; amount: string; isInclusive: boolean }
  total: { label: string; amount: string }
} {
  const result: any = {
    subtotal: {
      label: 'Subtotal',
      amount: formatPrice(breakdown.subtotal),
    },
    tax: {
      label: breakdown.breakdown.taxLabel,
      amount: formatPrice(breakdown.taxAmount),
      isInclusive: breakdown.breakdown.isTaxInclusive,
    },
    total: {
      label: 'Total',
      amount: formatPrice(breakdown.total),
    },
  }

  if (breakdown.breakdown.showServiceCharge) {
    result.serviceCharge = {
      label: breakdown.breakdown.serviceChargeLabel,
      amount: formatPrice(breakdown.serviceCharge),
    }
  }

  return result
}
