// src/utils/api/models/User.js

/**
 * User class for API payloads/responses with serialization and validation
 */
class User {
  #id;
  #name;
  #email;
  #password;
  #role;

  /**
   * Creates a new User instance
   * @param {Object} params - User properties
   * @param {string} params.id - Unique identifier
   * @param {string} params.name - User name
   * @param {string} params.email - User email
   * @param {string} [params.password] - User password
   * @param {string} [params.role] - User role (e.g., admin, user)
   * @throws {Error} If required fields are invalid
   */
  constructor({ id, name, email, password, role }) {
    if (!id) throw new Error('User ID is required');
    if (!name) throw new Error('User name is required');
    if (!email || !this.#isValidEmail(email)) throw new Error('Valid email is required');

    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#password = password || null;
    this.#role = role || 'user';
  }

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether the email is valid
   */
  #isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get id() {
    return this.#id;
  }

  set name(name) {
    if (!name) throw new Error('User name cannot be empty');
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set email(email) {
    if (!email || !this.#isValidEmail(email)) throw new Error('Valid email is required');
    this.#email = email;
  }

  get email() {
    return this.#email;
  }

  set password(password) {
    this.#password = password || null;
  }

  get password() {
    return this.#password;
  }

  set role(role) {
    this.#role = role || 'user';
  }

  get role() {
    return this.#role;
  }

  /**
   * Serializes the User to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      password: this.#password,
      role: this.#role,
    };
  }
}

module.exports = { User };