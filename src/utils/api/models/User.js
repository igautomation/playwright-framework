// src/utils/api/models/User.js

/**
 * User POJO for API payloads and responses (ESM Compliant).
 */

class User {
  /**
   * @param {Object} params - User parameters
   * @param {string} params.id - User ID
   * @param {string} params.name - User name
   * @param {string} params.email - User email
   * @param {string} [params.password] - User password
   * @param {string} [params.role] - User role
   */
  constructor({ id, name, email, password, role }) {
    if (!id) throw new Error('User ID is required');
    if (!name) throw new Error('User name is required');
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    this._id = id;
    this._name = name;
    this._email = email;
    this._password = password || null;
    this._role = role || 'user';
  }

  /**
   * Validates an email address
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getId() {
    return this._id;
  }

  setName(name) {
    if (!name) throw new Error('User name cannot be empty');
    this._name = name;
  }

  getName() {
    return this._name;
  }

  setEmail(email) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
    this._email = email;
  }

  getEmail() {
    return this._email;
  }

  setPassword(password) {
    this._password = password || null;
  }

  getPassword() {
    return this._password;
  }

  setRole(role) {
    this._role = role || 'user';
  }

  getRole() {
    return this._role;
  }

  /**
   * Serializes the user object to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      password: this._password,
      role: this._role,
    };
  }
}

export default User;