'use client'

import { useCallback } from 'react'
import { useTenantSettings } from '@/src/contexts/tenant-settings-context'
import {
  calculateOrderTotal,
  formatPriceBreakdown,
  type OrderItem,
  type PriceBreakdown,
} from '@/src/lib/helpers/price-calculator'
import { useFormat } from './use-format'

/**
 * Hook that provides price calculation with tenant settings.
 * Automatically uses tenant tax and service charge settings.
 *
 * @example
 * const { calculatePrice, formatBreakdown } = usePriceCalculation()
 * const breakdown = calculatePrice([{ price: 100000, quantity: 2 }], 4) // party size = 4
 * const formatted = formatBreakdown(breakdown)
 */
export function usePriceCalculation() {
  const { settings } = useTenantSettings()
  const { formatPrice: formatCurrency } = useFormat()

  /**
   * Calculate order total with tenant settings
   */
  const calculatePrice = useCallback(
    (items: OrderItem[], partySize?: number): PriceBreakdown => {
      return calculateOrderTotal(items, settings.tax, settings.service_charge, partySize)
    },
    [settings.tax, settings.service_charge],
  )

  /**
   * Format price breakdown for display
   */
  const formatBreakdown = useCallback(
    (breakdown: PriceBreakdown) => {
      return formatPriceBreakdown(breakdown, formatCurrency)
    },
    [formatCurrency],
  )

  return {
    /** Calculate order total with tax and service charge */
    calculatePrice,
    /** Format breakdown for display */
    formatBreakdown,
    /** Access tax settings directly */
    taxSettings: settings.tax,
    /** Access service charge settings directly */
    serviceChargeSettings: settings.service_charge,
  }
}
