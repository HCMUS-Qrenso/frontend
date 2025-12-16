import { create } from 'zustand'
import { setTenantId } from '@/lib/axios'
import type { TenantSummary } from '@/types/tenants'

interface TenantState {
  tenants: TenantSummary[]
  selectedTenantId: string | null
  setTenants: (tenants: TenantSummary[]) => void
  selectTenant: (tenantId: string) => void
  resetTenant: () => void
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenants: [],
  selectedTenantId: null,

  setTenants: (tenants) => {
    set({ tenants })
  },

  selectTenant: (tenantId) => {
    const { tenants } = get()
    const exists = tenants.some((t) => t.id === tenantId)
    if (!exists) return

    setTenantId(tenantId)
    set({ selectedTenantId: tenantId })
  },

  resetTenant: () => {
    setTenantId(null)
    set({ selectedTenantId: null, tenants: [] })
  },
}))


