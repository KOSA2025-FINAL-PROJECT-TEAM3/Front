import { STORAGE_KEYS } from '@config/constants'

export const attachAuthInterceptor = (axiosInstance) =>
  axiosInstance.interceptors.request.use(
    (config) => {
      if (typeof window === 'undefined') {
        return config
      }

      const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

export default attachAuthInterceptor
