import { create } from 'zustand'
import { setAccessToken } from '@/lib/axios'
import type { AuthResponse, User } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'accessToken'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  setAuth: (payload: AuthResponse) => void
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

  setAuth: (payload) => {
    setAccessToken(payload.accessToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
    }
    set({
      user: payload.user,
      accessToken: payload.accessToken,
      isAuthenticated: true,
    })
  },

  setUser: (user) => set({ user }),

  setToken: (token) => {
    setAccessToken(token)
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
    }
    set({ accessToken: token, isAuthenticated: !!token })
  },

  clearAuth: () => {
    setAccessToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  initAuth: () => {
    if (typeof window === 'undefined') return
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
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
