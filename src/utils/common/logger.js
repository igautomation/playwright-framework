/**
 * Simple logger utility
 */
class Logger {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };

    // Set default log level from environment variable or default to INFO
    this.logLevel = process.env.LOG_LEVEL
      ? this.logLevels[process.env.LOG_LEVEL.toUpperCase()]
      : this.logLevels.INFO;
  }

  /**
   * Set log level
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
   */
  setLogLevel(level) {
    if (this.logLevels[level.toUpperCase()] !== undefined) {
      this.logLevel = this.logLevels[level.toUpperCase()];
    }
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {string} Formatted log message
   */
  formatLog(level, message, data) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      if (typeof data === 'object') {
        try {
          logMessage += ` ${JSON.stringify(data)}`;
        } catch (error) {
          logMessage += ` [Object]`;
        }
      } else {
        logMessage += ` ${data}`;
      }
    }

    return logMessage;
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  debug(message, data) {
    if (this.logLevel <= this.logLevels.DEBUG) {
      console.debug(this.formatLog('DEBUG', message, data));
    }
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  info(message, data) {
    if (this.logLevel <= this.logLevels.INFO) {
      console.info(this.formatLog('INFO', message, data));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  warn(message, data) {
    if (this.logLevel <= this.logLevels.WARN) {
      console.warn(this.formatLog('WARN', message, data));
    }
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  error(message, data) {
    if (this.logLevel <= this.logLevels.ERROR) {
      console.error(this.formatLog('ERROR', message, data));
    }
  }
}

module.exports = new Logger();