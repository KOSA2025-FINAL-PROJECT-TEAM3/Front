import httpClient from './httpClient'
import { STORAGE_KEYS } from '@config/constants'

const runtimeEnv = typeof import.meta !== 'undefined' ? import.meta.env : {}
const USE_MOCK_API = runtimeEnv?.VITE_USE_MOCK_API === 'true'
const MOCK_DELAY_MS = Number(runtimeEnv?.VITE_MOCK_DELAY || 250)

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise((resolve) => {
    if (ms > 0) {
      setTimeout(resolve, ms)
    } else {
      resolve()
    }
  })

const isDevModeEnabled = () =>
  typeof window !== 'undefined' &&
  window.localStorage.getItem(STORAGE_KEYS.DEV_MODE) === 'true'

const shouldUseMock = () => USE_MOCK_API || isDevModeEnabled()

export class ApiClient {
  constructor({ basePath = '' } = {}) {
    this.basePath = basePath
  }

  resolvePath(path = '') {
    if (!path) return this.basePath
    if (path.startsWith('http')) return path
    const normalizedBase = this.basePath.endsWith('/')
      ? this.basePath.slice(0, -1)
      : this.basePath
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizedBase}${normalizedPath}`
  }

  async request(config, options = {}) {
    const { mockResponse, useMock = shouldUseMock() } = options
    if (useMock && mockResponse) {
      await delay()
      return typeof mockResponse === 'function' ? mockResponse() : mockResponse
    }

    const response = await httpClient.request({
      ...config,
      url: this.resolvePath(config.url || config.path || ''),
    })
    return response?.data ?? response
  }

  get(path, config, options) {
    return this.request(
      {
        method: 'get',
        path,
        ...config,
      },
      options,
    )
  }

  post(path, data, config, options) {
    return this.request(
      {
        method: 'post',
        path,
        data,
        ...config,
      },
      options,
    )
  }

  put(path, data, config, options) {
    return this.request(
      {
        method: 'put',
        path,
        data,
        ...config,
      },
      options,
    )
  }

  patch(path, data, config, options) {
    return this.request(
      {
        method: 'patch',
        path,
        data,
        ...config,
      },
      options,
    )
  }

  delete(path, config, options) {
    return this.request(
      {
        method: 'delete',
        path,
        ...config,
      },
      options,
    )
  }
}

export default ApiClient
