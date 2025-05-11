const { test, expect } = require('@playwright/test');
const TestDataFactory = require('../../utils/common/testDataFactory');
const schemaValidator = require('../../utils/api/schemaValidator');

test.describe('TestDataFactory @validation', () => {
  test('should generate data from simple schema', async () => {
    const simpleSchema = {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'number' },
        name: { type: 'string' }
      }
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(simpleSchema);
    
    expect(payload).toHaveProperty('id');
    expect(typeof payload.id).toBe('number');
    expect(payload).toHaveProperty('name');
    expect(typeof payload.name).toBe('string');
  });
  
  test('should generate data with all types', async () => {
    const complexSchema = {
      type: 'object',
      properties: {
        stringProp: { type: 'string' },
        numberProp: { type: 'number' },
        integerProp: { type: 'integer' },
        booleanProp: { type: 'boolean' },
        arrayProp: { 
          type: 'array',
          items: { type: 'string' }
        },
        objectProp: {
          type: 'object',
          properties: {
            nestedProp: { type: 'string' }
          }
        }
      }
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(complexSchema);
    
    expect(typeof payload.stringProp).toBe('string');
    expect(typeof payload.numberProp).toBe('number');
    expect(Number.isInteger(payload.integerProp)).toBeTruthy();
    expect(typeof payload.booleanProp).toBe('boolean');
    expect(Array.isArray(payload.arrayProp)).toBeTruthy();
    expect(typeof payload.objectProp).toBe('object');
    expect(typeof payload.objectProp.nestedProp).toBe('string');
  });
  
  test('should handle special string formats', async () => {
    const formatSchema = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        url: { type: 'string', format: 'uri' },
        date: { type: 'string', format: 'date-time' }
      }
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(formatSchema);
    
    expect(payload.email).toContain('@');
    expect(payload.url.startsWith('http')).toBeTruthy();
    expect(new Date(payload.date).toString()).not.toBe('Invalid Date');
  });
  
  test('should respect enum values', async () => {
    const enumSchema = {
      type: 'object',
      properties: {
        status: { 
          type: 'string',
          enum: ['pending', 'approved', 'rejected']
        },
        priority: {
          type: 'number',
          enum: [1, 2, 3]
        }
      }
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(enumSchema);
    
    expect(['pending', 'approved', 'rejected']).toContain(payload.status);
    expect([1, 2, 3]).toContain(payload.priority);
  });
  
  test('should apply overrides correctly', async () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }
    };
    
    const overrides = {
      id: 12345,
      name: 'Test Name',
      email: 'test@example.com'
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(schema, overrides);
    
    expect(payload.id).toBe(12345);
    expect(payload.name).toBe('Test Name');
    expect(payload.email).toBe('test@example.com');
  });
  
  test('should ensure all required fields are present', async () => {
    const schema = {
      type: 'object',
      required: ['id', 'name', 'email', 'status'],
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        description: { type: 'string' },
        status: { type: 'boolean' }
      }
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(schema);
    
    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('name');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('status');
    
    // Register schema for validation
    schemaValidator.addSchema('test-required', schema);
    const result = schemaValidator.validate('test-required', payload);
    expect(result.valid).toBeTruthy();
  });
  
  test('should generate nested objects and arrays', async () => {
    const nestedSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' }
                }
              }
            }
          }
        }
      }
    };
    
    const payload = TestDataFactory.generatePayloadFromSchema(nestedSchema);
    
    expect(payload.user).toBeDefined();
    expect(typeof payload.user.id).toBe('number');
    expect(typeof payload.user.name).toBe('string');
    expect(Array.isArray(payload.user.roles)).toBeTruthy();
    
    if (payload.user.roles.length > 0) {
      const role = payload.user.roles[0];
      expect(typeof role.id).toBe('number');
      expect(typeof role.name).toBe('string');
    }
  });
});