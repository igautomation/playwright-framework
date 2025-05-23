/**
 * Core Utilities
 * 
 * Provides core utility functions for the framework
 */

/**
 * Core Utilities class
 */
class CoreUtils {
  /**
   * Format a date according to the specified format
   * @param {Date|string|number} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  static formatDate(date, format = 'yyyy-MM-dd') {
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    
    const tokens = {
      yyyy: d.getFullYear(),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      dd: String(d.getDate()).padStart(2, '0'),
      HH: String(d.getHours()).padStart(2, '0'),
      mm: String(d.getMinutes()).padStart(2, '0'),
      ss: String(d.getSeconds()).padStart(2, '0'),
      SSS: String(d.getMilliseconds()).padStart(3, '0')
    };
    
    return format.replace(/yyyy|MM|dd|HH|mm|ss|SSS/g, match => tokens[match]);
  }
  
  /**
   * Check if a string is a valid email
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  static isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Generate a random string
   * @param {number} length - Length of the string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  static randomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    const charsetLength = charset.length;
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charsetLength));
    }
    
    return result;
  }
  
  /**
   * Generate a random number between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static randomNumber(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }
    
    const clone = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = this.deepClone(obj[key]);
      }
    }
    
    return clone;
  }
  
  /**
   * Merge objects deeply
   * @param {Object} target - Target object
   * @param {...Object} sources - Source objects
   * @returns {Object} Merged object
   */
  static deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (source === undefined) return target;
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    
    return this.deepMerge(target, ...sources);
  }
  
  /**
   * Check if value is an object
   * @param {*} item - Value to check
   * @returns {boolean} True if object
   * @private
   */
  static isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  /**
   * Wait for a specified time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Retry a function until it succeeds or reaches max attempts
   * @param {Function} fn - Function to retry
   * @param {Object} options - Options
   * @returns {Promise<*>} Function result
   */
  static async retry(fn, options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const delay = options.delay || 1000;
    const exponential = options.exponential || false;
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts) {
          const waitTime = exponential ? delay * Math.pow(2, attempt - 1) : delay;
          await this.wait(waitTime);
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Format a number with commas as thousands separators
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  /**
   * Format a file size in bytes to a human-readable string
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted size
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  /**
   * Convert a string to camelCase
   * @param {string} str - String to convert
   * @returns {string} camelCase string
   */
  static toCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  }
  
  /**
   * Convert a string to snake_case
   * @param {string} str - String to convert
   * @returns {string} snake_case string
   */
  static toSnakeCase(str) {
    return str
      .replace(/\s+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
  }
  
  /**
   * Convert a string to kebab-case
   * @param {string} str - String to convert
   * @returns {string} kebab-case string
   */
  static toKebabCase(str) {
    return str
      .replace(/\s+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
}

module.exports = CoreUtils;