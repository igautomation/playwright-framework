const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a random user object for API/UI testing.
 * @returns {object} - User data with name, email, and ID
 */
function generateUser() {
  return {
    id: uuidv4(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}

/**
 * Generates form input data for UI testing.
 * @returns {object} - Form data with username and password
 */
function generateFormData() {
  return {
    username: faker.internet.userName(),
    password: faker.internet.password(8),
  };
}

module.exports = { generateUser, generateFormData };