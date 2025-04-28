// src/utils/api/models/User.js

/**
 * User POJO for API payloads and responses
 * @param {Object} params - User parameters
 * @param {string} params.id - User ID
 * @param {string} params.name - User name
 * @param {string} params.email - User email
 * @param {string} [params.password] - User password
 * @param {string} [params.role] - User role
 */
function User({ id, name, email, password, role }) {
  if (!id) throw new Error('User ID is required');
  if (!name) throw new Error('User name is required');
  if (!email || !this.isValidEmail(email)) throw new Error('Valid email is required');
  this._id = id;
  this._name = name;
  this._email = email;
  this._password = password || null;
  this._role = role || 'user';
}

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
User.prototype.isValidEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

User.prototype.getId = function () {
  return this._id;
};

User.prototype.setName = function (name) {
  if (!name) throw new Error('User name cannot be empty');
  this._name = name;
};

User.prototype.getName = function () {
  return this._name;
};

User.prototype.setEmail = function (email) {
  if (!email || !this.isValidEmail(email)) throw new Error('Valid email is required');
  this._email = email;
};

User.prototype.getEmail = function () {
  return this._email;
};

User.prototype.setPassword = function (password) {
  this._password = password || null;
};

User.prototype.getPassword = function () {
  return this._password;
};

User.prototype.setRole = function (role) {
  this._role = role || 'user';
};

User.prototype.getRole = function () {
  return this._role;
};

/**
 * Serializes the user to JSON
 * @returns {Object} JSON representation of the user
 */
User.prototype.toJSON = function () {
  return {
    id: this._id,
    name: this._name,
    email: this._email,
    password: this._password,
    role: this._role,
  };
};

module.exports = User;