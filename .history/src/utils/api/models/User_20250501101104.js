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
    };
  }
}

export default User;