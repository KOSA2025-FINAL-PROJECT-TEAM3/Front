/**
 * Core Logger Utility
 * - Controls console output based on environment
 * - Provides consistent logging interface
 */
export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console.log(...args)
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console.warn(...args)
    }
  },
  error: (...args) => {
    // Errors are always logged for debugging purposes
    console.error(...args)
  },
  debug: (...args) => {
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console.debug(...args)
    }
  },
  log: (...args) => {
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console.log(...args)
    }
  },
}

export default logger
