import { create } from 'zustand'
import { setAccessToken, setTenantId } from '@/lib/axios'
import { authApi } from '@/lib/api/auth'
import type { AuthResponse, User } from '@/types/auth'
import { useTenantStore } from './tenant-store'

// BroadcastChannel for cross-tab logout synchronization
const logoutChannel = typeof window !== 'undefined' ? new BroadcastChannel('auth-logout') : null

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  authStatus: AuthStatus
  setAuth: (payload: AuthResponse, rememberMe?: boolean) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearAuth: () => void
  bootstrapAuth: () => Promise<void>
}

// Listen for logout events from other tabs
if (logoutChannel) {
  logoutChannel.onmessage = () => {
    console.log('[AuthStore] Logout broadcast received from another tab')
    // Clear auth state when receiving logout from another tab
    const tenantStore = useTenantStore.getState()
    setAccessToken(null)
    setTenantId(null)
    tenantStore.resetTenant()

    // Cleanup localStorage/sessionStorage nếu còn token cũ
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('accessToken_session')
    }

    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authStatus: 'unauthenticated',
    })
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
  authStatus: 'unknown',

  setAuth: (payload, rememberMe = true) => {
    const tenantStore = useTenantStore.getState()

    setAccessToken(payload.accessToken)

    // Role-aware tenant handling
    if (payload.user.role === 'owner') {
      // Owner can manage multiple tenants → do not bind a fixed tenantId here
      setTenantId(null)
      tenantStore.resetTenant()
    } else {
      // Admin/staff belong to exactly one tenant
      setTenantId(payload.user.tenantId)
      tenantStore.resetTenant()
    }

    // Access token chỉ lưu trong memory, không lưu vào storage
    set({
      user: payload.user,
      accessToken: payload.accessToken,
      isAuthenticated: true,
      authStatus: 'authenticated',
    })
  },

  setUser: (user) => {
    const tenantStore = useTenantStore.getState()

    if (!user) {
      // Logout: clear toàn bộ thông tin
      setTenantId(null)
      tenantStore.resetTenant()
      set({ user: null })
      return
    }

    if (user.role === 'owner') {
      // Owner: tenant được chọn thông qua tenant-store (dropdown / auto-select).
      // KHÔNG override tenantId ở đây để giữ nguyên x-tenant-id đã được set
      // trong flow login hoặc AdminLayout.
      set({ user })
      return
    }

    // Admin/staff: luôn follow tenantId từ profile
    setTenantId(user.tenantId ?? null)
    tenantStore.resetTenant()
    set({ user })
  },

  setToken: (token) => {
    setAccessToken(token)
    // Access token chỉ lưu trong memory, không lưu vào storage
    set({
      accessToken: token,
      isAuthenticated: !!token,
      authStatus: !!token ? 'authenticated' : 'unauthenticated',
    })
  },

  clearAuth: () => {
    setAccessToken(null)
    setTenantId(null)
    const tenantStore = useTenantStore.getState()
    tenantStore.resetTenant()
    // Cleanup localStorage/sessionStorage nếu còn token cũ
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('accessToken_session')
    }

    // Broadcast logout to other tabs
    if (logoutChannel) {
      console.log('[AuthStore] Broadcasting logout to other tabs')
      logoutChannel.postMessage('LOGOUT')
    }

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authStatus: 'unauthenticated',
    })
  },

  bootstrapAuth: async () => {
    if (typeof window === 'undefined') return

    // Chỉ bootstrap một lần
    if (get().authStatus !== 'unknown') return

    try {
      set({ authStatus: 'unknown' })

      // Gọi refresh endpoint để lấy access token mới từ refresh cookie
      const authResponse = await authApi.refresh()

      // Thành công: set access token vào memory
      setAccessToken(authResponse.accessToken)
      const tenantStore = useTenantStore.getState()

      // Role-aware tenant handling
      if (authResponse.user.role === 'owner') {
        const persistedTenantId =
          typeof window !== 'undefined' ? localStorage.getItem('selectedTenantId') : null
        setTenantId(persistedTenantId)
        // Don't reset tenant store for owner to preserve selectedTenantId
      } else {
        setTenantId(authResponse.user.tenantId)
        tenantStore.resetTenant()
      }

      set({
        user: authResponse.user,
        accessToken: authResponse.accessToken,
        isAuthenticated: true,
        isHydrated: true,
        authStatus: 'authenticated',
      })
    } catch (error) {
      // Thất bại: clear token và set unauthenticated
      setAccessToken(null)
      setTenantId(null)
      const tenantStore = useTenantStore.getState()
      tenantStore.resetTenant()

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isHydrated: true,
        authStatus: 'unauthenticated',
      })
    }
  },
}))
