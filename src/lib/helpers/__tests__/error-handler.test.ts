/**
 * Error Handler Unit Tests
 *
 * Tests for API error handling utilities.
 */

import { toast } from 'sonner'
import {
  extractErrorMessage,
  getErrorStatus,
  isApiError,
  handleApiError,
  handleApiErrorWithStatus,
} from '../error-handler'

// Mock console.error to prevent noise in test output
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('extractErrorMessage', () => {
  afterEach(() => {
    consoleErrorSpy.mockClear()
  })

  it('should extract string message from API error response', () => {
    const error = {
      response: {
        data: {
          message: 'Email already exists',
        },
      },
    }

    expect(extractErrorMessage(error)).toBe('Email already exists')
  })

  it('should join array messages from API error response', () => {
    const error = {
      response: {
        data: {
          message: ['Field email is required', 'Field password is required'],
        },
      },
    }

    expect(extractErrorMessage(error)).toBe(
      'Field email is required, Field password is required'
    )
  })

  it('should extract message from network error (error.message)', () => {
    const error = {
      message: 'Network Error',
    }

    expect(extractErrorMessage(error)).toBe('Network Error')
  })

  it('should return default message when no message found', () => {
    const error = {}

    expect(extractErrorMessage(error)).toBe('Có lỗi xảy ra. Vui lòng thử lại.')
  })

  it('should use custom default message when provided', () => {
    const error = {}
    const customDefault = 'Lỗi tùy chỉnh'

    expect(extractErrorMessage(error, customDefault)).toBe(customDefault)
  })

  it('should handle null/undefined error', () => {
    expect(extractErrorMessage(null)).toBe('Có lỗi xảy ra. Vui lòng thử lại.')
    expect(extractErrorMessage(undefined)).toBe('Có lỗi xảy ra. Vui lòng thử lại.')
  })

  it('should prioritize API response message over error.message', () => {
    const error = {
      message: 'Generic error',
      response: {
        data: {
          message: 'Specific API error',
        },
      },
    }

    expect(extractErrorMessage(error)).toBe('Specific API error')
  })
})

describe('getErrorStatus', () => {
  it('should return status code from API error', () => {
    const error = {
      response: {
        status: 401,
      },
    }

    expect(getErrorStatus(error)).toBe(401)
  })

  it('should return undefined when no status', () => {
    const error = {
      message: 'Network Error',
    }

    expect(getErrorStatus(error)).toBeUndefined()
  })

  it('should return undefined for null/undefined error', () => {
    expect(getErrorStatus(null)).toBeUndefined()
    expect(getErrorStatus(undefined)).toBeUndefined()
  })

  it('should handle various status codes', () => {
    expect(getErrorStatus({ response: { status: 400 } })).toBe(400)
    expect(getErrorStatus({ response: { status: 403 } })).toBe(403)
    expect(getErrorStatus({ response: { status: 404 } })).toBe(404)
    expect(getErrorStatus({ response: { status: 500 } })).toBe(500)
  })
})

describe('isApiError', () => {
  it('should return true for API error with response data', () => {
    const error = {
      response: {
        data: { message: 'Error' },
      },
    }

    expect(isApiError(error)).toBe(true)
  })

  it('should return false for network error without response', () => {
    const error = {
      message: 'Network Error',
    }

    expect(isApiError(error)).toBe(false)
  })

  it('should return false for null/undefined', () => {
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
  })

  it('should return false for error with empty response', () => {
    const error = {
      response: {},
    }

    expect(isApiError(error)).toBe(false)
  })
})

describe('handleApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show toast with extracted error message', () => {
    const error = {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    }

    handleApiError(error)

    expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
  })

  it('should log error to console by default', () => {
    const error = { message: 'Test error' }

    handleApiError(error)

    expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', error)
  })

  it('should not log error when logError is false', () => {
    const error = { message: 'Test error' }

    handleApiError(error, undefined, { logError: false })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('should not show toast when showToast is false', () => {
    const error = { message: 'Test error' }

    handleApiError(error, undefined, { showToast: false })

    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should use custom default message', () => {
    const error = {}
    const customMessage = 'Lỗi đăng nhập'

    handleApiError(error, customMessage)

    expect(toast.error).toHaveBeenCalledWith(customMessage)
  })
})

describe('handleApiErrorWithStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call custom handler for specific status code', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    }
    const handler401 = jest.fn()

    handleApiErrorWithStatus(error, { 401: handler401 })

    expect(handler401).toHaveBeenCalledWith(error)
    expect(toast.error).not.toHaveBeenCalled() // Handler handles it
  })

  it('should show toast when handler returns string', () => {
    const error = {
      response: {
        status: 403,
        data: { message: 'Forbidden' },
      },
    }

    handleApiErrorWithStatus(error, {
      403: () => 'Bạn không có quyền truy cập',
    })

    expect(toast.error).toHaveBeenCalledWith('Bạn không có quyền truy cập')
  })

  it('should fallback to default handler when no status handler', () => {
    const error = {
      response: {
        status: 500,
        data: { message: 'Server Error' },
      },
    }

    handleApiErrorWithStatus(error, { 401: jest.fn() })

    expect(toast.error).toHaveBeenCalledWith('Server Error')
  })

  it('should fallback to default handler when no status in error', () => {
    const error = {
      message: 'Network Error',
    }

    handleApiErrorWithStatus(error, { 401: jest.fn() }, 'Connection failed')

    // Note: error.message ('Network Error') takes priority over defaultMessage
    // because extractErrorMessage finds error.message first
    expect(toast.error).toHaveBeenCalledWith('Network Error')
  })

  it('should work without any status handlers provided', () => {
    const error = {
      response: {
        status: 400,
        data: { message: 'Bad Request' },
      },
    }

    handleApiErrorWithStatus(error)

    expect(toast.error).toHaveBeenCalledWith('Bad Request')
  })
})
