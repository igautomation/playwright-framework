const { test, expect } = require('@playwright/test');
const schemaValidator = require('../../utils/api/schemaValidator');
const TestDataFactory = require('../../utils/common/testDataFactory');
const fs = require('fs');
const path = require('path');

test.describe('API Schema Validation Demo @demo @api', () => {
  test.beforeAll(() => {
    // Load schemas
    const schemasDir = path.resolve(__dirname, '../../../data/schemas');

    // Load employee schema
    const employeeSchemaPath = path.join(schemasDir, 'employee.schema.json');
    const employeeSchema = JSON.parse(
      fs.readFileSync(employeeSchemaPath, 'utf8')
    );
    schemaValidator.addSchema('employee', employeeSchema);

    // Create and load user schema if it doesn't exist
    const userSchemaPath = path.join(schemasDir, 'user.schema.json');
    if (!fs.existsSync(userSchemaPath)) {
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
      fs.writeFileSync(userSchemaPath, JSON.stringify(userSchema, null, 2));
      schemaValidator.addSchema('user', userSchema);
    } else {
      const userSchema = JSON.parse(fs.readFileSync(userSchemaPath, 'utf8'));
      schemaValidator.addSchema('user', userSchema);
    }
  });

  test('Validate user data against schema', async () => {
    // Generate user data
    const userData = TestDataFactory.generateUser();

    // Validate against schema
    const result = schemaValidator.validate('user', userData);

    // Verify validation passed
    expect(result.valid).toBeTruthy();
    expect(result.errors).toBeNull();

    console.log('Valid user data:', userData);
  });

  test('Detect validation errors for invalid data', async () => {
    // Create invalid user data (missing required fields)
    const invalidUserData = {
      firstName: 'John',
      lastName: 'Doe',
      // Missing required id, username, and email
    };

    // Validate against schema
    const result = schemaValidator.validate('user', invalidUserData);

    // Verify validation failed
    expect(result.valid).toBeFalsy();
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);

    console.log('Validation errors:', result.errors);
  });

  test('Generate dynamic payload from schema', async () => {
    // Get user schema
    const userSchema = schemaValidator.getSchemas().get('user');

    // Generate payload from schema
    const payload = TestDataFactory.generatePayloadFromSchema(userSchema);

    // Validate generated payload against schema
    const result = schemaValidator.validate('user', payload);

    // Verify validation passed
    expect(result.valid).toBeTruthy();

    console.log('Generated payload from schema:', payload);
  });

  test('Generate payload with overrides', async () => {
    // Get user schema
    const userSchema = schemaValidator.getSchemas().get('user');

    // Generate payload with overrides
    const payload = TestDataFactory.generatePayloadFromSchema(userSchema, {
      username: 'testuser123',
      email: 'test@example.com',
      userStatus: 1,
    });

    // Validate generated payload against schema
    const result = schemaValidator.validate('user', payload);

    // Verify validation passed
    expect(result.valid).toBeTruthy();

    // Verify overrides were applied
    expect(payload.username).toBe('testuser123');
    expect(payload.email).toBe('test@example.com');
    expect(payload.userStatus).toBe(1);

    console.log('Generated payload with overrides:', payload);
  });
});
