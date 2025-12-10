import ApiClient from './ApiClient'
import envConfig from '@config/environment.config'

class AuthApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: envConfig.AUTH_API_URL,
      basePath: '/api/auth',
    })
  }

  login(email, password) {
    const payload = { email, password }
    return this.post('/login', payload)
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

    return this.post('/signup', requestPayload)
  }

  kakaoLogin(authorizationCode) {
    const payload = { authorizationCode }
    return this.post('/kakao-login', payload)
  }

  selectRole(token, role) {
    const payload = { role }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    return this.post('/select-role', payload, config)
  }

  logout(token) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    return this.post('/logout', {}, config).catch(() => ({
      success: true,
    }))
  }
}

export const authApiClient = new AuthApiClient()
export { AuthApiClient }