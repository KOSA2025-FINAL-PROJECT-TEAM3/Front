import { ROUTE_PATHS } from '@config/routes.config'
import { navigateTo } from '@core/routing/navigation'
import { toast } from '@shared/components/toast/toastStore'

const redirectToLogin = () => navigateTo(ROUTE_PATHS.login, { replace: true })

export const attachErrorInterceptor = (axiosInstance) =>
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const code = error?.response?.data?.code

      if (code === 'SECURITY_001') {
        toast.warning(error?.response?.data?.message || '부적절한 요청이 감지되었습니다. 반복 시 서비스 이용이 제한될 수 있습니다.')
      }

      if (status === 503 && (code === 'SECURITY_002' || code === 'SECURITY_003')) {
        toast.error('일시적인 서비스 오류입니다. 잠시 후 다시 시도해주세요.')
      }

      if (status === 401) {
        redirectToLogin()
      }
      return Promise.reject(error)
    },
  )

export default attachErrorInterceptor
