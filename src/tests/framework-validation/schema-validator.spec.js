const { test, expect } = require('@playwright/test');
const schemaValidator = require('../../utils/api/schemaValidator');
const fs = require('fs');
const path = require('path');

test.describe('Schema Validator @validation', () => {
  test.beforeAll(() => {
    // Load user schema
    const userSchemaPath = path.resolve(
      __dirname,
      '../../../data/schemas/user.schema.json'
    );
    const userSchema = JSON.parse(fs.readFileSync(userSchemaPath, 'utf8'));

    // Register schema
    schemaValidator.addSchema('user', userSchema);
  });

  test('should validate valid data', async () => {
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

    const result = schemaValidator.validate('user', validUser);
    expect(result.valid).toBeTruthy();
    expect(result.errors).toBeNull();
  });

  test('should detect missing required properties', async () => {
    const invalidUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    };

    const result = schemaValidator.validate('user', invalidUser);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Missing required property: id');
    expect(result.errors).toContain('Missing required property: username');
  });

  test('should detect invalid property types', async () => {
    const invalidUser = {
      id: 'not-a-number',
      username: 'testuser',
      email: 'test@example.com',
    };

    const result = schemaValidator.validate('user', invalidUser);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Property id should be a number');
  });

  test('should detect invalid enum values', async () => {
    const invalidUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      userStatus: 2, // Invalid enum value
    };

    const result = schemaValidator.validate('user', invalidUser);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain(
      'Property userStatus should be one of: 0, 1'
    );
  });
});
