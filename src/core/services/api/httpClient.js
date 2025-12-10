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

attachAuthInterceptor(httpClient)
attachErrorInterceptor(httpClient)

export default httpClient
