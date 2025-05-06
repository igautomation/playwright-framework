<<<<<<< HEAD
// src/utils/api/models/User.js

/**
 * User model for use in API tests and data factories.
 * Helps build, validate, and serialize user data with consistent schema.
 */

class User {
  /**
   * Create a user object.
   *
   * @param {Object} params - User parameters
   * @param {string} [params.id] - Optional user ID
   * @param {string} params.name - User name
   * @param {string} params.email - User email
   * @param {string} [params.password] - User password (optional)
   * @param {string} [params.role] - User role (optional)
   */
  constructor({ id, name, email, password, role }) {
    this._id = id || null;
    this._name = name;
    this._email = email;
    this._password = password || null;
    this._role = role || 'user';
  }

  /**
   * Validates current user instance fields.
   * Throws if required fields are missing or invalid.
   */
  validate() {
    if (!this._name) {
      throw new Error('User name is required');
    }

    if (!this._email || !this.isValidEmail(this._email)) {
      throw new Error('Valid email is required');
    }
  }

  /**
   * Checks if an email address is valid.
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // --- Getters & Setters ---

  getId() {
    return this._id;
  }

  setId(id) {
    this._id = id;
  }

  getName() {
    return this._name;
  }

  setName(name) {
    if (!name) throw new Error('Name cannot be empty');
    this._name = name;
  }

  getEmail() {
    return this._email;
  }

  setEmail(email) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email');
    }
    this._email = email;
  }

  getPassword() {
    return this._password;
  }

  setPassword(password) {
    this._password = password || null;
  }

  getRole() {
    return this._role;
  }

  setRole(role) {
    this._role = role || 'user';
  }

  /**
   * Serializes the user object into a plain JSON structure.
   * Used when sending payloads to API.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      password: this._password,
      role: this._role
=======
/**
 * User POJO model for API testing
 */
class User {
  // Private properties using _ prefix instead of # for better compatibility
  _id;
  _username;
  _firstName;
  _lastName;
  _email;
  _password;
  _phone;
  _userStatus;

  /**
   * Constructor
   * @param {string|Object} username - Username or user data object
   * @param {string} password - Password (optional if username is an object)
   */
  constructor(username, password) {
    if (typeof username === 'object') {
      const userData = username;
      this._id = userData.id || 0;
      this._username = userData.username || '';
      this._firstName = userData.firstName || '';
      this._lastName = userData.lastName || '';
      this._email = userData.email || '';
      this._password = userData.password || '';
      this._phone = userData.phone || '';
      this._userStatus = userData.userStatus || 0;
    } else {
      this._id = 0;
      this._username = username || '';
      this._password = password || '';
      this._firstName = '';
      this._lastName = '';
      this._email = '';
      this._phone = '';
      this._userStatus = 0;
    }
  }

  // Getters and setters
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get username() {
    return this._username;
  }

  set username(value) {
    this._username = value;
  }

  get firstName() {
    return this._firstName;
  }

  set firstName(value) {
    this._firstName = value;
  }

  get lastName() {
    return this._lastName;
  }

  set lastName(value) {
    this._lastName = value;
  }

  get email() {
    return this._email;
  }

  set email(value) {
    this._email = value;
  }

  get password() {
    return this._password;
  }

  set password(value) {
    this._password = value;
  }

  get phone() {
    return this._phone;
  }

  set phone(value) {
    this._phone = value;
  }

  get userStatus() {
    return this._userStatus;
  }

  set userStatus(value) {
    this._userStatus = value;
  }

  // Get full name
  get fullName() {
    return [this._firstName, this._lastName].filter(Boolean).join(' ');
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    // For auth endpoint, we only need username and password
    if (!this._id && !this._firstName && !this._lastName && !this._email && !this._phone) {
      return {
        username: this._username,
        password: this._password
      };
    }
    
    // For other endpoints, return the full user object
    return {
      id: this._id,
      username: this._username,
      firstName: this._firstName,
      lastName: this._lastName,
      email: this._email,
      password: this._password,
      phone: this._phone,
      userStatus: this._userStatus,
    };
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
   * Validate user data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this._username) {
      errors.push('Username is required');
    }

    if (!this._email && this._id !== 0) { // Only validate email for full user objects
      errors.push('Email is required');
    } else if (this._email && !this._email.includes('@')) {
      errors.push('Email is invalid');
    }

    return {
      valid: errors.length === 0,
      errors,
>>>>>>> 51948a2 (Main v1.0)
    };
  }
}

<<<<<<< HEAD
export default User;
=======
module.exports = User;
>>>>>>> 51948a2 (Main v1.0)
