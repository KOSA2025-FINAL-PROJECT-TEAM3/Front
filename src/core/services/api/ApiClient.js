import httpClient from './httpClient'

export class ApiClient {
  constructor({ basePath = '', baseURL = null } = {}) {
    this.basePath = basePath
    this.baseURL = baseURL // Service-specific base URL (e.g., http://localhost:8081)
  }

  resolvePath(path = '') {
    // If full URL provided, use as-is
    if (path.startsWith('http')) return path

    // Build full URL: baseURL + basePath + path
    const base = this.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base

    const normalizedBasePath = this.basePath
      ? (this.basePath.startsWith('/') ? this.basePath : `/${this.basePath}`)
      : ''

    const normalizedPath = path
      ? (path.startsWith('/') ? path : `/${path}`)
      : ''

    return `${normalizedBase}${normalizedBasePath}${normalizedPath}`
  }

  async request(config) {
    const response = await httpClient.request({
      ...config,
      url: this.resolvePath(config.url || config.path || ''),
    })
    return response?.data ?? response
  }

  get(path, config) {
    return this.request({
      method: 'get',
      path,
      ...config,
    })
  }

  post(path, data, config) {
    return this.request({
      method: 'post',
      path,
      data,
      ...config,
    })
  }

  put(path, data, config) {
    return this.request({
      method: 'put',
      path,
      data,
      ...config,
    })
  }

  patch(path, data, config) {
    return this.request({
      method: 'patch',
      path,
      data,
      ...config,
    })
  }

  delete(path, config) {
    return this.request({
      method: 'delete',
      path,
      ...config,
    })
  }
}

export default ApiClient