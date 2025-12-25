import { create } from 'zustand'
import { setTenantId } from '@/src/lib/axios'
import type { TenantSummary } from '@/src/features/admin/tenants/types/tenants'

interface TenantState {
  tenants: TenantSummary[]
  selectedTenantId: string | null
  setTenants: (tenants: TenantSummary[]) => void
  selectTenant: (tenantId: string) => void
  resetTenant: () => void
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenants: [],
  selectedTenantId: (() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('selectedTenantId') : null
    if (id) setTenantId(id)
    return id
  })(),

  setTenants: (tenants) => {
    set({ tenants })
  },

  selectTenant: (tenantId) => {
    const { tenants } = get()
    const exists = tenants.some((t) => t.id === tenantId)
    if (!exists) return

    setTenantId(tenantId)
    set({ selectedTenantId: tenantId })
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTenantId', tenantId)
    }
  },

  resetTenant: () => {
    setTenantId(null)
    set({ selectedTenantId: null, tenants: [] })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedTenantId')
    }
  },
}))
