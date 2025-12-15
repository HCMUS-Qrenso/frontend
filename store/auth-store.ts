import { create } from 'zustand'
import { setAccessToken, setTenantId } from '@/lib/axios'
import type { AuthResponse, User } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'accessToken'
const SESSION_TOKEN_KEY = 'accessToken_session'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  setAuth: (payload: AuthResponse, rememberMe?: boolean) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearAuth: () => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (payload, rememberMe = true) => {
    setAccessToken(payload.accessToken)
    setTenantId(payload.user.tenantId)
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        // Lưu vào localStorage (persist qua browser restart)
        localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
        sessionStorage.removeItem(SESSION_TOKEN_KEY)
      } else {
        // Lưu vào sessionStorage (chỉ tồn tại trong session hiện tại)
        sessionStorage.setItem(SESSION_TOKEN_KEY, payload.accessToken)
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
    }
    set({
      user: payload.user,
      accessToken: payload.accessToken,
      isAuthenticated: true,
    })
  },

  setUser: (user) => {
    setTenantId(user?.tenantId ?? null)
    set({ user })
  },

  setToken: (token) => {
    setAccessToken(token)
    if (typeof window !== 'undefined') {
      if (token) {
        // Kiểm tra xem token đang ở đâu để giữ nguyên storage type
        const localToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY)

        if (localToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, token)
        } else if (sessionToken) {
          sessionStorage.setItem(SESSION_TOKEN_KEY, token)
        } else {
          // Mặc định lưu vào localStorage nếu không có token nào
          localStorage.setItem(ACCESS_TOKEN_KEY, token)
        }
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        sessionStorage.removeItem(SESSION_TOKEN_KEY)
      }
    }
    set({ accessToken: token, isAuthenticated: !!token })
  },

  clearAuth: () => {
    setAccessToken(null)
    setTenantId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      sessionStorage.removeItem(SESSION_TOKEN_KEY)
    }
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  initAuth: () => {
    if (typeof window === 'undefined') return
    // Ưu tiên localStorage (rememberMe = true), sau đó mới đến sessionStorage
    const localToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY)
    const storedToken = localToken || sessionToken

    if (storedToken) {
      setAccessToken(storedToken)
      set({
        accessToken: storedToken,
        isAuthenticated: true,
        isHydrated: true,
      })
    } else {
      set({
        accessToken: null,
        isAuthenticated: false,
        isHydrated: true,
      })
    }
  },
}))
