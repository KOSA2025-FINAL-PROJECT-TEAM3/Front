import ApiClient from './ApiClient'

const buildMockToken = (prefix) => `${prefix}_${Date.now()}`
const maskEmail = (email = '') => email.split('@')[0] || 'user'

class AuthApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/auth' })
  }

  login(email, password) {
    const payload = { email, password }
    const mockResponse = () => ({
      user: {
        id: 'auth-mock-user',
        email,
        name: maskEmail(email),
      },
      accessToken: buildMockToken('accessToken'),
      role: null,
    })

    return this.post('/login', payload, undefined, { mockResponse })
  }

  signup(email, password, name, role) {
    const payload = { email, password, name, role }
    const mockResponse = () => ({
      user: {
        id: 'auth-mock-user',
        email,
        name,
        role,
      },
      accessToken: buildMockToken('accessToken'),
    })

    return this.post('/signup', payload, undefined, { mockResponse })
  }

  kakaoLogin(authorizationCode) {
    const payload = { authorizationCode }
    const mockResponse = () => ({
      user: {
        id: 'kakao-user',
        email: 'user@kakao.com',
        name: '카카오 사용자',
      },
      accessToken: buildMockToken('accessToken'),
      role: null,
    })

    return this.post('/kakao-login', payload, undefined, { mockResponse })
  }

  selectRole(token, role) {
    const payload = { role }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const mockResponse = () => ({
      success: true,
      role,
    })

    return this.post('/select-role', payload, config, { mockResponse })
  }

  logout(token) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const mockResponse = () => ({ success: true })

    return this.post('/logout', {}, config, { mockResponse }).catch(() => ({
      success: true,
    }))
  }
}

export const authApiClient = new AuthApiClient()
export { AuthApiClient }
