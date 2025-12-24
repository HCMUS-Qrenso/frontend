import { useCallback } from 'react'
import {
  handleApiError,
  handleApiErrorWithStatus,
  extractErrorMessage,
  getErrorStatus,
  isApiError,
} from '@/src/lib/helpers/error-handler'

/**
 * Custom hook for handling API errors
 * Provides convenient methods for error handling in components
 */
export function useErrorHandler() {
  /**
   * Handle API error with default toast notification
   */
  const handleError = useCallback((error: any, defaultMessage?: string) => {
    handleApiError(error, defaultMessage)
  }, [])

  /**
   * Handle API error with custom status code handlers
   */
  const handleErrorWithStatus = useCallback(
    (
      error: any,
      statusHandlers?: {
        [status: number]: (error: any) => void | string
      },
      defaultMessage?: string,
    ) => {
      handleApiErrorWithStatus(error, statusHandlers, defaultMessage)
    },
    [],
  )

  /**
   * Extract error message without showing toast
   * Useful for custom error handling
   */
  const getErrorMessage = useCallback((error: any, defaultMessage?: string) => {
    return extractErrorMessage(error, defaultMessage)
  }, [])

  /**
   * Get error status code
   */
  const getStatus = useCallback((error: any) => {
    return getErrorStatus(error)
  }, [])

  /**
   * Check if error is an API error
   */
  const checkIsApiError = useCallback((error: any) => {
    return isApiError(error)
  }, [])

  return {
    handleError,
    handleErrorWithStatus,
    getErrorMessage,
    getStatus,
    checkIsApiError,
  }
}
