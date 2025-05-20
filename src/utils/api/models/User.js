/**
 * User Model
 * 
 * Represents a user in the system
 */
const externalResources = require('../../../config/external-resources');

class User {
  #password;
  
  /**
   * Create a new User
   * @param {string|Object} username - Username or user data object
   * @param {string} password - Password (optional if username is an object)
   */
  constructor(username, password) {
    if (typeof username === 'object') {
      const userData = username;
      this.id = userData.id || 0;
      this.username = userData.username || '';
      this.#password = userData.password || '';
      this.firstName = userData.firstName || '';
      this.lastName = userData.lastName || '';
      this.email = userData.email || '';
    } else {
      this.id = 0;
      this.username = username || '';
      this.#password = password || '';
      this.firstName = '';
      this.lastName = '';
      this.email = '';
    }
  }
  
  /**
   * Get user password
   * @returns {string} Password
   */
  get password() {
    return this.#password;
  }
  
  /**
   * Set user password
   * @param {string} value - New password
   */
  set password(value) {
    this.#password = value;
  }
  
  /**
   * Get user full name
   * @returns {string} Full name
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  
  /**
   * Convert user to JSON for API requests
   * @param {string} endpoint - API endpoint
   * @param {boolean} includePassword - Whether to include password in the output
   * @returns {Object} User data for API
   */
  toJSON(endpoint, includePassword = false) {
    if (endpoint === 'auth' || endpoint === 'login') {
      // For auth endpoint, we only need username and password
      return {
        username: this.username,
        password: includePassword ? this.#password : undefined
      };
    }
    
    const userData = {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email
    };
    
    // Only include password if explicitly requested
    if (includePassword) {
      userData.password = this.#password;
    }
    
    return userData;
  }
  
  /**
   * Create a random user
   * @param {number} id - User ID
   * @returns {User} Random user
   */
  static createRandom(id = 0) {
    const username = `user${id || Math.floor(Math.random() * 10000)}`;
    const domain = externalResources.email.defaultDomain;
    
    return new User({
      id: id || Math.floor(Math.random() * 10000),
      username: username,
      password: `password${id}`,
      firstName: `First${id}`,
      lastName: `Last${id}`,
      email: `${username}@${domain}`
    });
  }
  
  /**
   * Validate user data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    
    if (!this.username) {
      errors.push('Username is required');
    } else if (this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!this.#password) {
      errors.push('Password is required');
    } else if (this.#password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (this.email && !this.email.includes('@')) {
      errors.push('Email must be valid');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = User;
module.exports.default = User;