import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class UserApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.AUTH_API_URL,
      basePath: '/api/auth/users',
    })
  }

  getMe() {
    return this.get('/me')
  }

  updateMe(data) {
    return this.put('/me', data)
  }

  uploadProfileImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return this.post('/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  deleteMe() {
    return this.delete('/me')
  }
}

export const userApiClient = new UserApiClient()
export { UserApiClient }
