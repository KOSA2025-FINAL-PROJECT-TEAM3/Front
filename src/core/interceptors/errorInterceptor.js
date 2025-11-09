import { ROUTE_PATHS } from '@config/routes.config'

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = ROUTE_PATHS.login
  }
}

export const attachErrorInterceptor = (axiosInstance) =>
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      if (status === 401) {
        redirectToLogin()
      }
      return Promise.reject(error)
    },
  )

export default attachErrorInterceptor
