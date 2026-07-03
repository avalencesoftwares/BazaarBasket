// packages/functions/src/utils/logger.ts
// Structured logging wrapper using Firebase Functions logger

import { logger as firebaseLogger } from 'firebase-functions';

interface LogContext {
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Structured logger that wraps Firebase Functions logger.
 * All logs include timestamp and structured context.
 */
export const logger = {
  info(message: string, context: LogContext = {}) {
    firebaseLogger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  },

  warn(message: string, context: LogContext = {}) {
    firebaseLogger.warn(message, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  },

  error(message: string, error?: unknown, context: LogContext = {}) {
    const errorInfo =
      error instanceof Error
        ? { errorMessage: error.message, errorStack: error.stack }
        : { errorMessage: String(error) };

    firebaseLogger.error(message, {
      ...context,
      ...errorInfo,
      timestamp: new Date().toISOString(),
    });
  },

  debug(message: string, context: LogContext = {}) {
    firebaseLogger.debug(message, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  },
};
