/**
 * Tenant Store Unit Tests
 *
 * Tests for tenant state management (Zustand store).
 */

import { useTenantStore } from '../tenant-store'
import { setTenantId } from '@/src/lib/axios'
import type { TenantSummary } from '@/src/features/admin/tenants/types/tenants'

// Mock axios setTenantId
jest.mock('@/src/lib/axios', () => ({
  setTenantId: jest.fn(),
}))

// Helper to create a complete TenantSummary mock
const createMockTenant = (overrides: Partial<TenantSummary> & { id: string; name: string }): TenantSummary => ({
  slug: `${overrides.name.toLowerCase().replace(/\s+/g, '-')}`,
  address: null,
  image: null,
  status: 'active',
  subscription_tier: 'basic',
  settings: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

describe('useTenantStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTenantStore.setState({
      tenants: [],
      selectedTenantId: null,
    })
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have empty tenants array initially', () => {
      const { tenants } = useTenantStore.getState()
      expect(tenants).toEqual([])
    })

    it('should have null selectedTenantId initially', () => {
      const { selectedTenantId } = useTenantStore.getState()
      expect(selectedTenantId).toBeNull()
    })
  })

  describe('setTenants', () => {
    it('should update tenants list', () => {
      const mockTenants = [
        createMockTenant({ id: 'tenant-1', name: 'Restaurant A' }),
        createMockTenant({ id: 'tenant-2', name: 'Restaurant B' }),
      ]

      useTenantStore.getState().setTenants(mockTenants)

      const { tenants } = useTenantStore.getState()
      expect(tenants).toHaveLength(2)
      expect(tenants[0].name).toBe('Restaurant A')
    })

    it('should replace existing tenants', () => {
      // Set initial tenants
      useTenantStore.getState().setTenants([
        createMockTenant({ id: 'old-1', name: 'Old Restaurant' }),
      ])

      // Replace with new tenants
      useTenantStore.getState().setTenants([
        createMockTenant({ id: 'new-1', name: 'New Restaurant' }),
      ])

      const { tenants } = useTenantStore.getState()
      expect(tenants).toHaveLength(1)
      expect(tenants[0].id).toBe('new-1')
    })
  })

  describe('selectTenant', () => {
    beforeEach(() => {
      // Setup tenants for selection tests
      useTenantStore.getState().setTenants([
        createMockTenant({ id: 'tenant-1', name: 'Restaurant A' }),
        createMockTenant({ id: 'tenant-2', name: 'Restaurant B' }),
      ])
    })

    it('should select a valid tenant', () => {
      useTenantStore.getState().selectTenant('tenant-1')

      const { selectedTenantId } = useTenantStore.getState()
      expect(selectedTenantId).toBe('tenant-1')
    })

    it('should call setTenantId with selected tenant', () => {
      useTenantStore.getState().selectTenant('tenant-2')

      expect(setTenantId).toHaveBeenCalledWith('tenant-2')
    })

    it('should persist selected tenant to localStorage', () => {
      useTenantStore.getState().selectTenant('tenant-1')

      expect(localStorage.setItem).toHaveBeenCalledWith('selectedTenantId', 'tenant-1')
    })

    it('should NOT select tenant if ID does not exist in list', () => {
      useTenantStore.getState().selectTenant('non-existent-id')

      const { selectedTenantId } = useTenantStore.getState()
      expect(selectedTenantId).toBeNull()
      expect(setTenantId).not.toHaveBeenCalled()
    })
  })

  describe('resetTenant', () => {
    beforeEach(() => {
      // Setup some state to reset
      useTenantStore.setState({
        tenants: [createMockTenant({ id: 'tenant-1', name: 'Restaurant' })],
        selectedTenantId: 'tenant-1',
      })
    })

    it('should clear selectedTenantId', () => {
      useTenantStore.getState().resetTenant()

      const { selectedTenantId } = useTenantStore.getState()
      expect(selectedTenantId).toBeNull()
    })

    it('should clear tenants array', () => {
      useTenantStore.getState().resetTenant()

      const { tenants } = useTenantStore.getState()
      expect(tenants).toEqual([])
    })

    it('should call setTenantId with null', () => {
      useTenantStore.getState().resetTenant()

      expect(setTenantId).toHaveBeenCalledWith(null)
    })

    it('should remove selectedTenantId from localStorage', () => {
      useTenantStore.getState().resetTenant()

      expect(localStorage.removeItem).toHaveBeenCalledWith('selectedTenantId')
    })
  })
})
