/**
 * KDS Ticket Business Logic
 * Extracted from ticket-card.tsx for better testability and maintainability
 */

import type { KdsOrder, KdsOrderItem, OrderItemStatus } from '../types/kds.types'

// ============================================
// Status Transitions
// ============================================

/**
 * Map of current status to next status
 */
export const NEXT_STATUS: Record<OrderItemStatus, OrderItemStatus | null> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: null,
  served: null,
  cancelled: null,
  returned: null,
}

/**
 * Terminal statuses - items that are "done" and cannot be advanced
 */
export const TERMINAL_STATUSES = new Set<OrderItemStatus>([
  'ready',
  'served',
  'cancelled',
  'returned',
])

// ============================================
// Action Config
// ============================================

export interface ActionConfig {
  label: string
  iconName: 'check' | 'play' | 'checkCircle'
}

/**
 * Action button configuration for each status
 */
export const ACTION_CONFIG: Record<OrderItemStatus, ActionConfig | null> = {
  pending: null, // Waiter handles pending->accepted, not KDS
  accepted: { label: 'Bắt đầu', iconName: 'play' },
  preparing: { label: 'Xong', iconName: 'checkCircle' },
  ready: null,
  served: null,
  cancelled: null,
  returned: null,
}

// ============================================
// Timing Calculations
// ============================================

/**
 * Calculate max prep time from items with fallback
 */
export function calcMaxPrepTime(items: KdsOrderItem[], fallbackMin = 15): number {
  if (!items || items.length === 0) return fallbackMin
  const prepTimes = items.map((i) => i.estimatedPrepTime ?? fallbackMin)
  return Math.max(...prepTimes)
}

/**
 * Calculate timing status based on elapsed time
 */
export interface TimingStatus {
  isWarning: boolean
  isOverdue: boolean
}

export function calcTiming(elapsedSec: number, maxPrepMin: number): TimingStatus {
  const elapsedMin = elapsedSec / 60
  return {
    isWarning: elapsedMin > maxPrepMin,
    isOverdue: elapsedMin > maxPrepMin * 1.5,
  }
}

/**
 * Calculate elapsed seconds from createdAt to now
 */
export function calcElapsedSec(createdAt: string | Date, now: number): number {
  const createdTime = new Date(createdAt).getTime()
  return Math.max(0, Math.floor((now - createdTime) / 1000))
}

// ============================================
// Item Status Helpers
// ============================================

/**
 * Check if all items are in terminal status (done)
 */
export function isAllDone(items: KdsOrderItem[]): boolean {
  if (!items || items.length === 0) return true
  return items.every((item) => TERMINAL_STATUSES.has(item.status))
}

/**
 * Get next status for an item
 */
export function getNextStatus(status: OrderItemStatus): OrderItemStatus | null {
  return NEXT_STATUS[status] ?? null
}

/**
 * Get action config for an item status
 */
export function getActionConfig(status: OrderItemStatus): ActionConfig | null {
  return ACTION_CONFIG[status] ?? null
}

/**
 * Filter items by status (for column display)
 */
export function filterItemsByStatus(
  items: KdsOrderItem[],
  highlightStatus?: OrderItemStatus
): KdsOrderItem[] {
  if (!highlightStatus) return items
  return items.filter((item) => item.status === highlightStatus)
}
