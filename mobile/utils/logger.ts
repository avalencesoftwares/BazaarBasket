// packages/mobile/utils/logger.ts
// Mobile logging utility with __DEV__ guards

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Mobile logger that only outputs in development mode.
 * In production, logs are silently discarded.
 */
export const logger = {
  debug(message: string, data?: Record<string, unknown>) {
    logMessage('debug', message, data);
  },

  info(message: string, data?: Record<string, unknown>) {
    logMessage('info', message, data);
  },

  warn(message: string, data?: Record<string, unknown>) {
    logMessage('warn', message, data);
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    if (__DEV__) {
      const errorInfo = error instanceof Error
        ? { errorMessage: error.message, errorStack: error.stack }
        : { errorMessage: String(error) };

      const entry: LogEntry = {
        level: 'error',
        message,
        data: { ...data, ...errorInfo },
        timestamp: new Date().toISOString(),
      };

      // eslint-disable-next-line no-console
      console.error(`[BazaarBasket] ${message}`, entry);
    }
  },
};

function logMessage(level: LogLevel, message: string, data?: Record<string, unknown>) {
  if (__DEV__) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(`[BazaarBasket] ${message}`, entry);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(`[BazaarBasket] ${message}`, entry);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(`[BazaarBasket] ${message}`, entry);
        break;
      default:
        break;
    }
  }
}
