import axios from 'axios'
import { API_CONFIG } from '@config/api.config'
import { attachAuthInterceptor } from '@/core/interceptors/authInterceptor'
import { attachErrorInterceptor } from '@/core/interceptors/errorInterceptor'

export const httpClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
})

attachAuthInterceptor(httpClient)
attachErrorInterceptor(httpClient)

export default httpClient
