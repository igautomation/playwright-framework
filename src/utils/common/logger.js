/**
 * Logger
 * 
 * Provides logging functionality for tests
 */
const fs = require('fs');
const path = require('path');

/**
 * Logger class
 */
class Logger {
  /**
   * @param {Object} options - Logger options
   * @param {string} options.logDir - Directory for log files
   * @param {boolean} options.console - Whether to log to console
   * @param {boolean} options.file - Whether to log to file
   * @param {string} options.level - Minimum log level
   */
  constructor(options = {}) {
    this.options = {
      logDir: 'reports/logs',
      console: true,
      file: true,
      level: 'info',
      ...options
    };
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Create log directory if it doesn't exist
    if (this.options.file && !fs.existsSync(this.options.logDir)) {
      fs.mkdirSync(this.options.logDir, { recursive: true });
    }
    
    this.logFile = path.join(this.options.logDir, `test-${new Date().toISOString().split('T')[0]}.log`);
  }
  
  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Formatted log message
   */
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }
  
  /**
   * Write log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   */
  log(level, message) {
    if (this.levels[level] < this.levels[this.options.level]) {
      return;
    }
    
    const formattedMessage = this.formatMessage(level, message);
    
    // Log to console
    if (this.options.console) {
      if (level === 'error') {
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
    
    // Log to file
    if (this.options.file) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }
  
  /**
   * Log debug message
   * @param {string} message - Log message
   */
  debug(message) {
    this.log('debug', message);
  }
  
  /**
   * Log info message
   * @param {string} message - Log message
   */
  info(message) {
    this.log('info', message);
  }
  
  /**
   * Log warning message
   * @param {string} message - Log message
   */
  warn(message) {
    this.log('warn', message);
  }
  
  /**
   * Log error message
   * @param {string} message - Log message
   */
  error(message) {
    this.log('error', message);
  }
}

// Create default logger instance
const logger = new Logger();

module.exports = logger;