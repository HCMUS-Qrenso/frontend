/**
 * Layout Transform Utilities
 * 
 * Utility functions and types for floor plan layout transformations.
 * Handles mapping between frontend TableItem and backend ZoneLayoutTable formats.
 */

import type { ZoneLayoutTable, TablePosition } from '@/src/features/admin/tables/types/tables'
import { formatRotation } from '@/src/features/admin/tables/utils/table-utils'

/**
 * TableItem - Frontend representation of a table in floor plan layout
 */
export interface TableItem {
  id: string
  type: 'rectangle' | 'circle' | 'oval'
  name: string
  seats: number
  area: string
  status: 'Available' | 'Occupied' | 'Waiting for bill' | 'Disabled'
  position: TablePosition
  rotation: number // Kept for backward compatibility, should sync with position.rotation
  size: { width: number; height: number }
  canBeMerged: boolean
  notes?: string
}

/**
 * Map backend status to frontend status
 */
export function mapStatus(status: string): TableItem['status'] {
  const statusMap: Record<string, TableItem['status']> = {
    available: 'Available',
    occupied: 'Occupied',
    waiting_for_payment: 'Waiting for bill',
    maintenance: 'Disabled',
  }
  return statusMap[status] || 'Available'
}

/**
 * Map backend shape to frontend type
 */
export function mapShape(shape: string | null): 'rectangle' | 'circle' | 'oval' {
  if (shape === 'circle') return 'circle'
  if (shape === 'oval') return 'oval'
  return 'rectangle' // default
}

/**
 * Map frontend status to backend status
 */
export function mapStatusToBackend(status: TableItem['status']): string {
  const statusMap: Record<TableItem['status'], string> = {
    Available: 'available',
    Occupied: 'occupied',
    'Waiting for bill': 'waiting_for_payment',
    Disabled: 'maintenance',
  }
  return statusMap[status] || 'available'
}

/**
 * Map frontend shape to backend shape
 */
export function mapShapeToBackend(type: TableItem['type']): string {
  if (type === 'circle') return 'circle'
  if (type === 'oval') return 'oval'
  return 'rectangle'
}

/**
 * Calculate table size based on type and number of seats
 */
export function calculateTableSize(
  type: 'rectangle' | 'circle' | 'oval',
  seats: number,
): { width: number; height: number } {
  // Rectangle: width > height
  if (type === 'rectangle') {
    if (seats <= 2) return { width: 80, height: 80 }
    if (seats <= 4) return { width: 120, height: 80 }
    if (seats <= 6) return { width: 140, height: 80 }
    if (seats <= 8) return { width: 160, height: 100 }
    if (seats <= 10) return { width: 180, height: 100 }
    // 11+ seats: base 200x120, add 20px width and 20px height per 2 seats
    const extraSeats = seats - 10
    const extraSize = Math.floor(extraSeats / 2) * 20
    return { width: 200 + extraSize, height: 120 + extraSize }
  }

  // Circle: width === height
  if (type === 'circle') {
    if (seats <= 2) return { width: 80, height: 80 }
    if (seats <= 4) return { width: 100, height: 100 }
    if (seats <= 6) return { width: 120, height: 120 }
    if (seats <= 8) return { width: 140, height: 140 }
    if (seats <= 10) return { width: 160, height: 160 }
    // 11+ seats: base 180x180, add 20px per 2 seats
    const extraSeats = seats - 10
    const extraSize = Math.floor(extraSeats / 2) * 20
    return { width: 180 + extraSize, height: 180 + extraSize }
  }

  // Oval: width > height (similar to rectangle but rounded)
  if (type === 'oval') {
    if (seats <= 2) return { width: 90, height: 70 }
    if (seats <= 4) return { width: 130, height: 90 }
    if (seats <= 6) return { width: 150, height: 100 }
    if (seats <= 8) return { width: 170, height: 120 }
    if (seats <= 10) return { width: 190, height: 130 }
    // 11+ seats: base 210x150, add 20px width and 10px height per 2 seats
    const extraSeats = seats - 10
    const extraWidth = Math.floor(extraSeats / 2) * 20
    const extraHeight = Math.floor(extraSeats / 2) * 10
    return { width: 210 + extraWidth, height: 150 + extraHeight }
  }

  // Fallback
  return { width: 120, height: 80 }
}

/**
 * Transform backend ZoneLayoutTable to frontend TableItem
 */
export function transformTableToItem(
  table: ZoneLayoutTable | (ZoneLayoutTable & { zone?: string }),
): TableItem {
  const tableType = mapShape(table.type)
  // Read rotation from API response (default to 0 if not present)
  const rawRotation = table.position?.rotation ?? 0
  const rotation = formatRotation(rawRotation)
  // Ensure position includes rotation
  const position: TablePosition = {
    x: table.position.x,
    y: table.position.y,
    rotation: rotation,
  }
  return {
    id: table.id,
    type: tableType,
    name: table.name,
    seats: table.seats,
    // Backend hiện trả field `zone` (zone name), còn type cũ là `area`
    area: (table as any).zone ?? (table as any).area ?? '',
    status: mapStatus(table.status),
    position: position,
    rotation: rotation, // Sync with position.rotation for backward compatibility
    size: calculateTableSize(tableType, table.seats),
    canBeMerged: tableType === 'rectangle',
  }
}
