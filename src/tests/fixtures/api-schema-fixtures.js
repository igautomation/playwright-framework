/**
 * Test fixtures for API schema validation tests
 */

const userSchema = {
  type: 'object',
  required: ['id', 'username', 'email'],
  properties: {
    id: {
      type: 'number',
      description: 'The user ID',
    },
    username: {
      type: 'string',
      description: 'The username',
    },
    firstName: {
      type: 'string',
      description: "The user's first name",
    },
    lastName: {
      type: 'string',
      description: "The user's last name",
    },
    email: {
      type: 'string',
      format: 'email',
      description: "The user's email address",
    },
    password: {
      type: 'string',
      description: "The user's password",
    },
    phone: {
      type: 'string',
      description: "The user's phone number",
    },
    userStatus: {
      type: 'number',
      description: 'User status',
      enum: [0, 1],
    },
  },
};

const invalidUserData = {
  firstName: 'John',
  lastName: 'Doe',
  // Missing required id, username, and email
};

const userOverrides = {
  username: 'testuser123',
  email: 'test@example.com',
  userStatus: 1,
};

module.exports = {
  userSchema,
  invalidUserData,
  userOverrides
};