// src/utils/common/logger.js

/**
 * Logger Utility for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Provides structured logging for tests and framework activities
 * - Logs both to files (error.log, combined.log) and console
 * - Uses JSON formatting with timestamps for consistency
 */

import { createLogger, format, transports } from 'winston';

// Initialize logger instance
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Log error messages to error.log
    new transports.File({ filename: 'logs/error.log', level: 'error' }),

    // Log all messages (info, warn, error) to combined.log
    new transports.File({ filename: 'logs/combined.log' }),

    // Also output logs to console for real-time debugging
    new transports.Console()
  ],
});

export default logger;