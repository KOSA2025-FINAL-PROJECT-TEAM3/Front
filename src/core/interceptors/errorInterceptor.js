import { ROUTE_PATHS } from '@config/routes.config'
import { navigateTo } from '@core/routing/navigation'

const redirectToLogin = () => navigateTo(ROUTE_PATHS.login, { replace: true })

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
