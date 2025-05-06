/**
 * User POJO model for API testing
 * 
 * This class represents a user entity for API testing purposes.
 * It provides methods for serialization, deserialization, and validation.
 */
class User {
  // Private properties using # for true privacy (modern approach)
  #id;
  #username;
  #firstName;
  #lastName;
  #email;
  #password;
  #phone;
  #userStatus;
  #createdAt;
  #updatedAt;

  /**
   * Constructor
   * @param {string|Object} username - Username or user data object
   * @param {string} password - Password (optional if username is an object)
   */
  constructor(username, password) {
    const now = new Date().toISOString();
    
    if (typeof username === 'object') {
      const userData = username;
      this.#id = userData.id || 0;
      this.#username = userData.username || '';
      this.#firstName = userData.firstName || '';
      this.#lastName = userData.lastName || '';
      this.#email = userData.email || '';
      this.#password = userData.password || '';
      this.#phone = userData.phone || '';
      this.#userStatus = userData.userStatus || 0;
      this.#createdAt = userData.createdAt || now;
      this.#updatedAt = userData.updatedAt || now;
    } else {
      this.#id = 0;
      this.#username = username || '';
      this.#password = password || '';
      this.#firstName = '';
      this.#lastName = '';
      this.#email = '';
      this.#phone = '';
      this.#userStatus = 0;
      this.#createdAt = now;
      this.#updatedAt = now;
    }
  }

  // Getters and setters
  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = value;
    this.#updateTimestamp();
  }

  get username() {
    return this.#username;
  }

  set username(value) {
    this.#username = value;
    this.#updateTimestamp();
  }

  get firstName() {
    return this.#firstName;
  }

  set firstName(value) {
    this.#firstName = value;
    this.#updateTimestamp();
  }

  get lastName() {
    return this.#lastName;
  }

  set lastName(value) {
    this.#lastName = value;
    this.#updateTimestamp();
  }

  get email() {
    return this.#email;
  }

  set email(value) {
    this.#email = value;
    this.#updateTimestamp();
  }

  get password() {
    return this.#password;
  }

  set password(value) {
    this.#password = value;
    this.#updateTimestamp();
  }

  get phone() {
    return this.#phone;
  }

  set phone(value) {
    this.#phone = value;
    this.#updateTimestamp();
  }

  get userStatus() {
    return this.#userStatus;
  }

  set userStatus(value) {
    this.#userStatus = value;
    this.#updateTimestamp();
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  // Get full name
  get fullName() {
    return [this.#firstName, this.#lastName].filter(Boolean).join(' ');
  }

  /**
   * Update the updatedAt timestamp
   * @private
   */
  #updateTimestamp() {
    this.#updatedAt = new Date().toISOString();
  }

  /**
   * Create a display name for the user
   * @returns {string} Display name
   */
  getDisplayName() {
    return this.fullName || this.#username;
  }

  /**
   * Check if user has admin privileges
   * @returns {boolean} True if user is admin
   */
  isAdmin() {
    return this.#userStatus === 1;
  }

  /**
   * Check if user is active
   * @returns {boolean} True if user is active
   */
  isActive() {
    return this.#userStatus !== 0;
  }

  /**
   * Serialize to JSON
   * @param {boolean} includePassword - Whether to include password in the output
   * @returns {Object} JSON representation
   */
  toJSON(includePassword = true) {
    // For auth endpoint, we only need username and password
    if (!this.#id && !this.#firstName && !this.#lastName && !this.#email && !this.#phone) {
      return {
        username: this.#username,
        password: includePassword ? this.#password : undefined
      };
    }
    
    // For other endpoints, return the full user object
    const userData = {
      id: this.#id,
      username: this.#username,
      firstName: this.#firstName,
      lastName: this.#lastName,
      email: this.#email,
      phone: this.#phone,
      userStatus: this.#userStatus,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };

    // Only include password if explicitly requested
    if (includePassword) {
      userData.password = this.#password;
    }
    
    return userData;
  }

  /**
   * Deserialize from JSON
   * @param {Object} json - JSON object
   * @returns {User} User instance
   */
  static fromJSON(json) {
    return new User(json);
  }

  /**
   * Create a random user
   * @returns {User} Random user instance
   */
  static createRandom() {
    const id = Math.floor(Math.random() * 10000);
    const username = `user${id}`;
    
    return new User({
      id,
      username,
      firstName: 'Test',
      lastName: `User${id}`,
      email: `${username}@example.com`,
      password: `password${id}`,
      phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
      userStatus: Math.floor(Math.random() * 2)
    });
  }

  /**
   * Validate user data
   * @param {boolean} strict - Whether to perform strict validation
   * @returns {Object} Validation result
   */
  validate(strict = false) {
    const errors = [];

    // Basic validations
    if (!this.#username) {
      errors.push('Username is required');
    } else if (this.#username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!this.#email && this.#id !== 0) { // Only validate email for full user objects
      errors.push('Email is required');
    } else if (this.#email && !this.#validateEmail(this.#email)) {
      errors.push('Email is invalid');
    }

    // Strict validations (only applied when strict=true)
    if (strict) {
      if (!this.#password) {
        errors.push('Password is required');
      } else if (this.#password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }

      if (this.#phone && !this.#validatePhone(this.#phone)) {
        errors.push('Phone number format is invalid');
      }

      if (!this.#firstName) {
        errors.push('First name is required');
      }

      if (!this.#lastName) {
        errors.push('Last name is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   * @private
   */
  #validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone number is valid
   * @private
   */
  #validatePhone(phone) {
    // Simple regex for phone validation (allows various formats)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Clone the user
   * @returns {User} Cloned user instance
   */
  clone() {
    return User.fromJSON(this.toJSON());
  }

  /**
   * Compare with another user
   * @param {User} otherUser - User to compare with
   * @param {Array<string>} fields - Fields to compare (optional)
   * @returns {boolean} True if users are equal
   */
  equals(otherUser, fields = null) {
    if (!(otherUser instanceof User)) {
      return false;
    }

    const thisJson = this.toJSON();
    const otherJson = otherUser.toJSON();
    
    if (fields) {
      // Compare only specified fields
      return fields.every(field => thisJson[field] === otherJson[field]);
    } else {
      // Compare all fields except timestamps
      const { createdAt: c1, updatedAt: u1, ...thisData } = thisJson;
      const { createdAt: c2, updatedAt: u2, ...otherData } = otherJson;
      
      return JSON.stringify(thisData) === JSON.stringify(otherData);
    }
  }
}

module.exports = User;