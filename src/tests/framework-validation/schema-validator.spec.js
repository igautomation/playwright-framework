const { test, expect } = require('@playwright/test');
const schemaValidator = require('../../utils/api/schemaValidator');
const fs = require('fs');
const path = require('path');
const {
  validUser,
  invalidUserMissingRequired,
  invalidUserWrongType,
  invalidUserWrongEnum
} = require('../fixtures/schema-validator-fixtures');

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
    const result = schemaValidator.validate('user', validUser);
    expect(result.valid).toBeTruthy();
    expect(result.errors).toBeNull();
  });

  test('should detect missing required properties', async () => {
    const result = schemaValidator.validate('user', invalidUserMissingRequired);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Missing required property: id');
    expect(result.errors).toContain('Missing required property: username');
  });

  test('should detect invalid property types', async () => {
    const result = schemaValidator.validate('user', invalidUserWrongType);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Property id should be a number');
  });

  test('should detect invalid enum values', async () => {
    const result = schemaValidator.validate('user', invalidUserWrongEnum);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain(
      'Property userStatus should be one of: 0, 1'
    );
  });
});
