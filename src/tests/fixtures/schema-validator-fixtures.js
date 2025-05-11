/**
 * Test fixtures for schema validator tests
 */

const validUser = {
  id: 1,
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  phone: '1234567890',
  userStatus: 1,
};

const invalidUserMissingRequired = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
};

const invalidUserWrongType = {
  id: 'not-a-number',
  username: 'testuser',
  email: 'test@example.com',
};

const invalidUserWrongEnum = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  userStatus: 2, // Invalid enum value
};

module.exports = {
  validUser,
  invalidUserMissingRequired,
  invalidUserWrongType,
  invalidUserWrongEnum
};