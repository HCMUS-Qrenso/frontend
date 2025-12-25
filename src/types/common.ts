/**
 * Common types used across multiple features
 * These types represent shared API contracts
 */

// Pagination
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

// Generic API Response for mutation operations (delete, update, etc.)
export interface MessageResponse {
  success?: boolean
  message: string
  data?: {
    message?: string
    deleted_at?: string
    updated_count?: number
  }
}

// API Error Response from backend
export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
}

// Generic sort order type
export type SortOrder = 'asc' | 'desc'
