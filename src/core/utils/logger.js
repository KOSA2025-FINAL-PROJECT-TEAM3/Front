const isDev = import.meta.env.MODE === 'development';
const isApiLoggingEnabled = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';

const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  // Special method for API logging to control verbosity easily
  api: (type, ...args) => {
    if (isDev && isApiLoggingEnabled) {
      console.log(`[API ${type}]`, ...args);
    }
  }
};

export default logger;
