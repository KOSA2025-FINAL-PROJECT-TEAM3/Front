/**
 * Core Logger Utility
 * - Controls console output based on environment
 * - Provides consistent logging interface
 */

const isDebugEnabled = () =>
  import.meta.env.VITE_DEBUG === 'true'

const isApiLoggingEnabled = () =>
  import.meta.env.VITE_ENABLE_API_LOGGING === 'true'

export const logger = {
  info: (...args) => {
    if (isDebugEnabled()) {
      console.log(...args)
    }
  },
  warn: (...args) => {
    if (isDebugEnabled()) {
      console.warn(...args)
    }
  },
  error: (...args) => {
    // Errors are always logged for debugging purposes
    console.error(...args)
  },
  debug: (...args) => {
    if (isDebugEnabled()) {
      console.debug(...args)
    }
  },
  log: (...args) => {
    if (isDebugEnabled()) {
      console.log(...args)
    }
  },
  api: (type, message, data) => {
    if (isApiLoggingEnabled()) {
      console.log(`[API ${type}]`, message, data)
    }
  },
}

export default logger

