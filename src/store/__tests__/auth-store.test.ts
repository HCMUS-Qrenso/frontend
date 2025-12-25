/**
 * Auth Store Unit Tests
 *
 * Tests for authentication state management (Zustand store).
 * Note: bootstrapAuth is not tested here as it makes real API calls.
 */

import { useAuthStore } from '../auth-store'
import { useTenantStore } from '../tenant-store'
import { setAccessToken, setTenantId } from '@/src/lib/axios'

// Mock axios functions
jest.mock('@/src/lib/axios', () => ({
  setAccessToken: jest.fn(),
  setTenantId: jest.fn(),
}))

// Mock auth API
jest.mock('@/src/features/auth/api/auth.api', () => ({
  authApi: {
    refresh: jest.fn(),
  },
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
      authStatus: 'unknown',
    })
    // Reset tenant store
    useTenantStore.setState({
      tenants: [],
      selectedTenantId: null,
    })
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Initial State', () => {
    it('should have null user initially', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('should have null accessToken initially', () => {
      expect(useAuthStore.getState().accessToken).toBeNull()
    })

    it('should not be authenticated initially', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should have unknown authStatus initially', () => {
      expect(useAuthStore.getState().authStatus).toBe('unknown')
    })
  })

  describe('setAuth', () => {
    const mockAuthResponse = {
      accessToken: 'test-access-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'owner' as const,
        tenantId: null,
      },
    }

    it('should set user and accessToken', () => {
      useAuthStore.getState().setAuth(mockAuthResponse)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockAuthResponse.user)
      expect(state.accessToken).toBe('test-access-token')
    })

    it('should set isAuthenticated to true', () => {
      useAuthStore.getState().setAuth(mockAuthResponse)

      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should set authStatus to authenticated', () => {
      useAuthStore.getState().setAuth(mockAuthResponse)

      expect(useAuthStore.getState().authStatus).toBe('authenticated')
    })

    it('should call setAccessToken with token', () => {
      useAuthStore.getState().setAuth(mockAuthResponse)

      expect(setAccessToken).toHaveBeenCalledWith('test-access-token')
    })

    it('should reset tenant for owner role', () => {
      useAuthStore.getState().setAuth(mockAuthResponse)

      expect(setTenantId).toHaveBeenCalledWith(null)
    })

    it('should set tenantId for staff role', () => {
      const staffResponse = {
        accessToken: 'staff-token',
        user: {
          id: 'staff-1',
          email: 'staff@example.com',
          fullName: 'Staff User',
          role: 'waiter' as const,
          tenantId: 'tenant-123',
        },
      }

      useAuthStore.getState().setAuth(staffResponse)

      expect(setTenantId).toHaveBeenCalledWith('tenant-123')
    })
  })

  describe('setUser', () => {
    it('should update user', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'owner' as const,
        tenantId: null,
      }

      useAuthStore.getState().setUser(mockUser)

      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('should clear tenant when setting null user', () => {
      useAuthStore.getState().setUser(null)

      expect(setTenantId).toHaveBeenCalledWith(null)
    })

    it('should set tenantId for non-owner user', () => {
      const staffUser = {
        id: 'staff-1',
        email: 'staff@example.com',
        fullName: 'Staff',
        role: 'waiter' as const,
        tenantId: 'tenant-456',
      }

      useAuthStore.getState().setUser(staffUser)

      expect(setTenantId).toHaveBeenCalledWith('tenant-456')
    })
  })

  describe('setToken', () => {
    it('should update accessToken', () => {
      useAuthStore.getState().setToken('new-token')

      expect(useAuthStore.getState().accessToken).toBe('new-token')
    })

    it('should set isAuthenticated based on token presence', () => {
      useAuthStore.getState().setToken('valid-token')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      useAuthStore.getState().setToken(null)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should update authStatus based on token', () => {
      useAuthStore.getState().setToken('valid-token')
      expect(useAuthStore.getState().authStatus).toBe('authenticated')

      useAuthStore.getState().setToken(null)
      expect(useAuthStore.getState().authStatus).toBe('unauthenticated')
    })

    it('should call setAccessToken', () => {
      useAuthStore.getState().setToken('my-token')

      expect(setAccessToken).toHaveBeenCalledWith('my-token')
    })
  })

  describe('clearAuth', () => {
    beforeEach(() => {
      // Setup authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com', fullName: 'Test', role: 'owner', tenantId: null },
        accessToken: 'some-token',
        isAuthenticated: true,
        authStatus: 'authenticated',
      })
    })

    it('should clear user', () => {
      useAuthStore.getState().clearAuth()

      expect(useAuthStore.getState().user).toBeNull()
    })

    it('should clear accessToken', () => {
      useAuthStore.getState().clearAuth()

      expect(useAuthStore.getState().accessToken).toBeNull()
    })

    it('should set isAuthenticated to false', () => {
      useAuthStore.getState().clearAuth()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should set authStatus to unauthenticated', () => {
      useAuthStore.getState().clearAuth()

      expect(useAuthStore.getState().authStatus).toBe('unauthenticated')
    })

    it('should call setAccessToken with null', () => {
      useAuthStore.getState().clearAuth()

      expect(setAccessToken).toHaveBeenCalledWith(null)
    })

    it('should call setTenantId with null', () => {
      useAuthStore.getState().clearAuth()

      expect(setTenantId).toHaveBeenCalledWith(null)
    })

    it('should remove tokens from storage', () => {
      useAuthStore.getState().clearAuth()

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('accessToken_session')
    })
  })
})
