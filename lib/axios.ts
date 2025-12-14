import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

const rawClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`
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

    if (error.response?.status === 401 && originalConfig && !originalConfig._retry) {
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
