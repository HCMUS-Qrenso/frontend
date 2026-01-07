/**
 * KDS Query Keys
 *
 * Centralized query key factory for KDS feature
 */

import type { KdsFilters } from '../types/kds.types'

export const kdsQueryKeys = {
  all: ['kds'] as const,
  orders: (filters?: KdsFilters) => [...kdsQueryKeys.all, 'orders', filters] as const,
}
