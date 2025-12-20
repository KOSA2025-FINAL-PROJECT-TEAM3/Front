const readEnv = (key) => {
  const raw = process.env[key]
  if (!raw) return ''
  return String(raw).trim()
}

const API_BASE_URL =
  readEnv('E2E_API_BASE_URL') || readEnv('VITE_API_BASE_URL') || 'http://localhost:80'

const FRONTEND_BASE_URL =
  readEnv('E2E_FRONTEND_BASE_URL') || readEnv('PLAYWRIGHT_BASE_URL') || ''

const AUTH_EMAIL = readEnv('E2E_AUTH_EMAIL')
const AUTH_PASSWORD = readEnv('E2E_AUTH_PASSWORD')

export const getApiBaseUrl = () => API_BASE_URL

export const buildApiUrl = (path) => new URL(path, API_BASE_URL).toString()

export const getFrontendBaseUrl = () => FRONTEND_BASE_URL

export const getAuthCredentials = () => {
  if (!AUTH_EMAIL || !AUTH_PASSWORD) return null
  return { email: AUTH_EMAIL, password: AUTH_PASSWORD }
}
