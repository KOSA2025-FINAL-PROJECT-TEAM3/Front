import axios from 'axios'
import { API_CONFIG } from '@config/api.config'
import { attachAuthInterceptor } from '@core/interceptors/authInterceptor'
import { attachErrorInterceptor } from '@core/interceptors/errorInterceptor'
import logger from '@core/utils/logger'

export const httpClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 로깅 인터셉터
httpClient.interceptors.request.use(
  (config) => {
    logger.api('REQUEST', `${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    })
    return config
  },
  (error) => {
    logger.error('[API REQUEST ERROR]', error)
    return Promise.reject(error)
  }
)

// 응답 로깅 인터셉터
httpClient.interceptors.response.use(
  (response) => {
    logger.api('RESPONSE', `${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    logger.error(`[API ERROR] ${error.response?.status || 'UNKNOWN'} ${error.config?.method.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// NOTE: response interceptor는 등록 역순으로 실행된다.
// refresh(401) 처리를 먼저 하고, 최종적으로 401이 남을 때만 로그인으로 리다이렉트하도록 순서를 유지한다.
attachErrorInterceptor(httpClient)
attachAuthInterceptor(httpClient)

export default httpClient
