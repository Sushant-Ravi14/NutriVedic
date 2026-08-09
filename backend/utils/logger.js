const Sentry = require('@sentry/node');

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  error: (message, error = null, meta = {}) => {
    console.error(`[ERROR] ${message}`, error, meta);
    if (process.env.NODE_ENV === 'production' && error) {
      Sentry.captureException(error, { extra: meta });
    }
  }
};

module.exports = logger;
