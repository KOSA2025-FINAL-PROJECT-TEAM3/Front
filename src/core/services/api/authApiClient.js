import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

const buildMockToken = (prefix) => `${prefix}_${Date.now()}`
const maskEmail = (email = '') => email.split('@')[0] || 'user'

class AuthApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.AUTH_API_URL,
      basePath: '/api/auth',
    })
  }

  login(email, password) {
    const payload = { email, password }
    const mockResponse = () => {
      // Mock: Retrieve stored customerRole from localStorage
      // In production, backend should return the user's role
      const storedUserData = typeof window !== 'undefined'
        ? window.localStorage.getItem('amapill-user-data')
        : null
      const storedRole = storedUserData
        ? JSON.parse(storedUserData).customerRole || null
        : null

      return {
        user: {
          id: 'auth-mock-user',
          email,
          name: maskEmail(email),
          userRole: 'ROLE_USER',
          customerRole: storedRole,
        },
        accessToken: buildMockToken('accessToken'),
        userRole: 'ROLE_USER',
        customerRole: storedRole,
      }
    }

    return this.post('/login', payload, undefined, { mockResponse })
  }

  signup(payloadOrEmail, password, name, role) {
    const payload =
      typeof payloadOrEmail === 'object' && payloadOrEmail !== null
        ? payloadOrEmail
        : {
            email: payloadOrEmail,
            password,
            name,
            customerRole: role,
          }
    const {
      email,
      password: userPassword,
      name: displayName,
      userRole = 'ROLE_USER',
      customerRole,
    } = payload

    const requestPayload = {
      email,
      password: userPassword,
      name: displayName,
      userRole,
      customerRole,
    }

    const mockResponse = () => ({
      user: {
        id: 'auth-mock-user',
        email,
        name: displayName,
        userRole,
        customerRole,
      },
      accessToken: buildMockToken('accessToken'),
      userRole,
      customerRole,
    })

    return this.post('/signup', requestPayload, undefined, { mockResponse })
  }

  kakaoLogin(authorizationCode) {
    const payload = { authorizationCode }
    const mockResponse = () => ({
      user: {
        id: 'kakao-user',
        email: 'user@kakao.com',
        name: '카카오 사용자',
        userRole: 'ROLE_USER',
        customerRole: null,
      },
      accessToken: buildMockToken('accessToken'),
      userRole: 'ROLE_USER',
      customerRole: null,
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
      customerRole: role,
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
