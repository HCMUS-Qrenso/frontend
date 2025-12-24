import { toast } from 'sonner'
import type { AxiosError } from 'axios'

/**
 * Extract error message from API error response
 * Handles both string and array messages from backend
 */
export function extractErrorMessage(
  error: any,
  defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại.',
): string {
  // Check if it's an Axios error with response
  if (error?.response?.data?.message) {
    const message = error.response.data.message

    // Handle array of messages
    if (Array.isArray(message)) {
      return message.join(', ')
    }

    // Handle string message
    if (typeof message === 'string') {
      return message
    }
  }

  // Check for error.message (network errors, etc.)
  if (error?.message && typeof error.message === 'string') {
    return error.message
  }

  // Fallback to default message
  return defaultMessage
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatus(error: any): number | undefined {
  if (error?.response?.status) {
    return error.response.status
  }
  return undefined
}

/**
 * Check if error is an API error (has response)
 */
export function isApiError(error: any): boolean {
  return !!error?.response?.data
}

/**
 * Handle API error and show toast notification
 * Automatically extracts error message from backend response
 */
export function handleApiError(
  error: any,
  defaultMessage?: string,
  options?: {
    logError?: boolean
    showToast?: boolean
  },
): void {
  const { logError = true, showToast = true } = options || {}

  // Log error for debugging
  if (logError) {
    console.error('API Error:', error)
  }

  // Extract error message
  const errorMessage = extractErrorMessage(error, defaultMessage)

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage)
  }
}

/**
 * Handle API error with custom logic for specific status codes
 */
export function handleApiErrorWithStatus(
  error: any,
  statusHandlers?: {
    [status: number]: (error: any) => void | string
  },
  defaultMessage?: string,
): void {
  const status = getErrorStatus(error)

  // Check if there's a custom handler for this status code
  if (status && statusHandlers?.[status]) {
    const handler = statusHandlers[status]
    const result = handler(error)

    // If handler returns a string, use it as message
    if (typeof result === 'string') {
      toast.error(result)
      return
    }

    // If handler returns void, assume it handled the error itself
    return
  }

  // Use default error handler
  handleApiError(error, defaultMessage)
}
