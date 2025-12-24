/**
 * Jest Setup File
 * 
 * This file runs before each test file.
 * Used to setup global mocks and extend Jest matchers.
 */

import '@testing-library/jest-dom'

// ============================================
// Mock: localStorage
// ============================================
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// ============================================
// Mock: sessionStorage
// ============================================
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// ============================================
// Mock: BroadcastChannel
// ============================================
class BroadcastChannelMock {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null
  
  constructor(name: string) {
    this.name = name
  }
  
  postMessage = jest.fn()
  close = jest.fn()
  addEventListener = jest.fn()
  removeEventListener = jest.fn()
  dispatchEvent = jest.fn(() => true)
}

Object.defineProperty(global, 'BroadcastChannel', {
  value: BroadcastChannelMock,
  writable: true,
})

// ============================================
// Mock: sonner toast
// ============================================
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

// ============================================
// Mock: window.URL
// ============================================
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(() => 'blob:mock-url'),
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: jest.fn(),
})

// ============================================
// Mock: next/navigation
// ============================================
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/admin/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// ============================================
// Reset mocks before each test
// ============================================
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
  jest.clearAllMocks()
})

// ============================================
// Suppress console errors in tests (optional)
// ============================================
// Uncomment if you want cleaner test output
// const originalError = console.error
// beforeAll(() => {
//   console.error = (...args) => {
//     if (args[0]?.includes?.('Warning:')) return
//     originalError.call(console, ...args)
//   }
// })
// afterAll(() => {
//   console.error = originalError
// })
