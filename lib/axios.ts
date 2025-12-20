import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

let accessToken: string | null = null
let tenantId: string | null = null
let refreshPromise: Promise<string | null> | null = null
let failedRequestsQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
  config: InternalAxiosRequestConfig & { _retry?: boolean }
}> = []

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const setTenantId = (tenant: string | null) => {
  tenantId = tenant
}

const rawClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

// Extend InternalAxiosRequestConfig to support custom flags
interface TenantAwareRequestConfig extends InternalAxiosRequestConfig {
  withoutTenant?: boolean
}

const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config: TenantAwareRequestConfig) => {
  // Đảm bảo headers tồn tại
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders
  }

  // Gắn Authorization nếu chưa có
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  // Cho phép skip gắn tenant cho một số request đặc biệt (ví dụ: GET /tenants for owner)
  const skipTenantHeader =
    (config as TenantAwareRequestConfig).withoutTenant ||
    (config.headers as Record<string, string | boolean | undefined>)['x-skip-tenant'] === 'true'

  // Gắn x-tenant-id nếu đã có tenantId, không bị skip và request chưa override
  if (!skipTenantHeader && tenantId && !('x-tenant-id' in config.headers)) {
    ;(config.headers as Record<string, string>)['x-tenant-id'] = tenantId
  }

  return config
})

const processFailedRequestsQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach(({ resolve, reject, config }) => {
    if (error || !token) {
      reject(error)
    } else {
      // Update token in headers and retry
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders
      }
      ;(config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`
      resolve(apiClient(config))
    }
  })

  failedRequestsQueue = []
}

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    // Nếu đang refresh, thêm vào queue và đợi
    return new Promise((resolve, reject) => {
      failedRequestsQueue.push({ resolve, reject, config: {} as any })
    })
  }

  refreshPromise = rawClient
    .post('/auth/refresh')
    .then((res) => {
      const newToken = res.data?.accessToken as string | null
      setAccessToken(newToken ?? null)
      processFailedRequestsQueue(null, newToken)
      return newToken ?? null
    })
    .catch((error) => {
      setAccessToken(null)
      processFailedRequestsQueue(error, null)

      // Clear auth state khi refresh thất bại
      if (typeof window !== 'undefined') {
        try {
          // Import dynamically to avoid circular dependency
          import('@/store/auth-store').then(({ useAuthStore }) => {
            useAuthStore.getState().clearAuth()
          })
        } catch (e) {
          console.warn('Failed to clear auth state after refresh failure')
        }
      }

      return Promise.reject(error)
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    // Không refresh token cho các endpoint auth (login, signup, refresh, etc.)
    const authEndpoints = [
      '/auth/login',
      '/auth/refresh',
      '/auth/signup',
      '/auth/logout',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ]
    const isAuthEndpoint =
      originalConfig?.url &&
      authEndpoints.some((endpoint) => originalConfig.url?.includes(endpoint))

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !isAuthEndpoint
    ) {
      originalConfig._retry = true

      // Thêm request vào queue và đợi refresh hoàn tất
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject, config: originalConfig })
        refreshAccessToken().catch(() => {
          // Queue đã được xử lý trong refreshAccessToken, không cần làm gì thêm
        })
      })
    }

    return Promise.reject(error)
  },
)

export { apiClient }
