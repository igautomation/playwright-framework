/**
 * Test fixtures for schema validation tests
 */

const testSchema = {
  type: 'object',
  required: ['id', 'name', 'email', 'isActive'],
  properties: {
    id: {
      type: 'number',
      description: 'The ID'
    },
    name: {
      type: 'string',
      description: 'The name'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'The email'
    },
    description: {
      type: 'string',
      description: 'The description'
    },
    isActive: {
      type: 'boolean',
      description: 'Active status'
    }
  }
};

const simpleTestSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'number',
      description: 'The ID'
    },
    name: {
      type: 'string',
      description: 'The name'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'The email'
    }
  }
};

const testOverrides = {
  id: 12345,
  name: 'Test Name',
  email: 'test@example.com'
};

module.exports = {
  testSchema,
  simpleTestSchema,
  testOverrides
};