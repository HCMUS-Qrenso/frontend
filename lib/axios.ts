import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

let accessToken: string | null = null
let tenantId: string | null = null
let refreshPromise: Promise<string | null> | null = null

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

// Extend AxiosRequestConfig to support custom flags
interface TenantAwareRequestConfig extends AxiosRequestConfig {
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

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise

  refreshPromise = rawClient
    .post('/auth/refresh')
    .then((res) => {
      const newToken = res.data?.accessToken as string | null
      setAccessToken(newToken ?? null)
      return newToken ?? null
    })
    .catch((error) => {
      setAccessToken(null)
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
    const originalConfig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined

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
      try {
        const newToken = await refreshAccessToken()
        if (newToken) {
          originalConfig.headers = {
            ...originalConfig.headers,
            Authorization: `Bearer ${newToken}`,
          }
          return apiClient(originalConfig)
        }
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export { apiClient }
