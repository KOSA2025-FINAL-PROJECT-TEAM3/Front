/**
 * Environment Configuration
 *
 * Dynamically detects deployment environment and provides appropriate URLs
 * Supports both development (Vite dev server on 5173) and production (Nginx on 80/443)
 *
 * @module environment.config
 */

/**
 * Get runtime environment configuration
 * @returns {Object} Environment configuration object
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  const isProduction = import.meta.env.MODE === 'production'
  const useNginx = import.meta.env.VITE_USE_NGINX === 'true'

  // For production, auto-detect from window.location
  const getProductionURL = (port = null) => {
    if (typeof window === 'undefined') return null

    const protocol = window.location.protocol
    const hostname = window.location.hostname

    // If port specified, append it (for direct service access)
    if (port) {
      return `${protocol}//${hostname}:${port}`
    }

    // If no port, use window.location.origin (Nginx reverse proxy)
    return window.location.origin
  }

  // API Configuration - Priority: env var > production detection > development default
  const getApiBaseURL = () => {
    // 1. Explicit environment variable (highest priority)
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL
    }

    const apiPort = import.meta.env.VITE_API_PORT || 8082

    // If behind Nginx, rely on window origin (port 80/443)
    if (useNginx && typeof window !== 'undefined') {
      return window.location.origin
    }

    // 2. Development default (Vite dev server)
    if (isDevelopment) {
      return `http://localhost:${apiPort}` // Direct backend access in dev
    }

    // 3. Production auto-detection
    if (isProduction) {
      const productionURL = getProductionURL(apiPort)
      if (productionURL) return productionURL
    }

    // Fallback
    return `http://localhost:${apiPort}`
  }

  // WebSocket Configuration
  const getWsBaseURL = () => {
    // 1. Explicit environment variable
    if (import.meta.env.VITE_WS_BASE_URL) {
      return import.meta.env.VITE_WS_BASE_URL
    }

    // 2. Development default
    if (isDevelopment) {
      return 'ws://localhost:8080/ws'
    }

    // 3. Production auto-detection
    if (isProduction && typeof window !== 'undefined') {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsPort = import.meta.env.VITE_WS_PORT

      if (wsPort) {
        return `${wsProtocol}://${window.location.hostname}:${wsPort}/ws`
      }

      // Assume Nginx proxies /ws
      return `${wsProtocol}://${window.location.host}/ws`
    }

    // Fallback
    return 'ws://localhost:8080/ws'
  }

  // Frontend URL Configuration
  const getFrontendURL = () => {
    // 1. Explicit environment variable
    if (import.meta.env.VITE_FRONTEND_URL) {
      return import.meta.env.VITE_FRONTEND_URL
    }

    // 2. Development default
    if (isDevelopment) {
      return 'http://localhost:5173'
    }

    // 3. Production auto-detection
    if (isProduction && typeof window !== 'undefined') {
      return window.location.origin
    }

    // Fallback
    return 'http://localhost:5173'
  }

  // Service-specific URLs (for microservices architecture)
  const getServiceURL = (envVar, defaultPort) => {
    // If env var set, use it
    if (import.meta.env[envVar]) {
      return import.meta.env[envVar]
    }

    // In development, direct service access
    if (!useNginx && isDevelopment) {
      return `http://localhost:${defaultPort}` // Direct service ports in dev
    }

    // When using Nginx, rely on origin (port 80/443) for all services
    if (useNginx && typeof window !== 'undefined') {
      return window.location.origin
    }

    // In production without Nginx, hit the service port directly
    if (isProduction) {
      const productionURL = getProductionURL(defaultPort)
      if (productionURL) return productionURL
    }

    // In production, assume API Gateway routes all /api/* requests
    // So we use the same base URL
    return getApiBaseURL()
  }

  const config = {
    // API Configuration
    API_BASE_URL: getApiBaseURL(),

    // Microservice-specific URLs
    AUTH_API_URL: getServiceURL('VITE_AUTH_API_URL', 8081),
    MEDICATION_API_URL: getServiceURL('VITE_MEDICATION_API_URL', 8082),
    FAMILY_API_URL: getServiceURL('VITE_FAMILY_API_URL', 8082),
    DIET_API_URL: getServiceURL('VITE_DIET_API_URL', 8082),
    SEARCH_API_URL: getServiceURL('VITE_SEARCH_API_URL', 8082),
    CHAT_API_URL: getServiceURL('VITE_CHAT_API_URL', 8082),

    // WebSocket Configuration
    WS_BASE_URL: getWsBaseURL(),

    // Frontend Configuration
    FRONTEND_URL: getFrontendURL(),

    // OAuth Configuration (Kakao)
    KAKAO_CLIENT_ID: import.meta.env.VITE_KAKAO_CLIENT_ID || '',
    KAKAO_REDIRECT_URI: import.meta.env.VITE_KAKAO_REDIRECT_URI || `${getFrontendURL()}/auth/kakao/callback`,

    // Feature Flags
    USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true',
    DEBUG_MODE: import.meta.env.VITE_DEBUG === 'true',
    ENABLE_DEV_MODE: import.meta.env.VITE_ENABLE_DEV_MODE === 'true',
    USE_NGINX: useNginx,

    // Application Settings
    API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
    NOTIFICATION_TIMEOUT: Number(import.meta.env.VITE_NOTIFICATION_TIMEOUT || 5000),
    ITEMS_PER_PAGE: Number(import.meta.env.VITE_ITEMS_PER_PAGE || 10),
    MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE || 5242880), // 5MB

    // Storage Keys
    TOKEN_STORAGE_KEY: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'amapill_token',
    REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'amapill_refresh_token',

    // Environment Detection
    isDevelopment,
    isProduction,
    mode: import.meta.env.MODE,
  }

  // Log configuration in development
  if (config.isDevelopment && config.DEBUG_MODE) {
    console.group('🔧 AMApill Frontend Configuration')
    console.log('Environment:', config.mode)
    console.log('API Base URL:', config.API_BASE_URL)
    console.log('WebSocket URL:', config.WS_BASE_URL)
    console.log('Frontend URL:', config.FRONTEND_URL)
    console.log('Use Nginx Proxy:', config.USE_NGINX)
    console.log('Auth Service:', config.AUTH_API_URL)
    console.log('Medication Service:', config.MEDICATION_API_URL)
    console.log('Use Mock API:', config.USE_MOCK_API)
    console.groupEnd()
  }

  return config
}

// Export singleton instance
export default getEnvironmentConfig()
