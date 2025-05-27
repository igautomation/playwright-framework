/**
 * Tests for SchemaValidator utility
 */
const { test, expect } = require('@playwright/test');
const { SchemaValidator } = require('../../utils/api/schemaValidator');

test.describe('SchemaValidator', () => {
  let validator;
  
  test.beforeEach(() => {
    validator = new SchemaValidator();
  });
  
  test('should validate simple types correctly', async () => {
    // String validation
    const stringSchema = { type: 'string' };
    expect(validator.validate('test', stringSchema).valid).toBeTruthy();
    expect(validator.validate(123, stringSchema).valid).toBeFalsy();
    
    // Number validation
    const numberSchema = { type: 'number' };
    expect(validator.validate(123, numberSchema).valid).toBeTruthy();
    expect(validator.validate('123', numberSchema).valid).toBeFalsy();
    
    // Boolean validation
    const booleanSchema = { type: 'boolean' };
    expect(validator.validate(true, booleanSchema).valid).toBeTruthy();
    expect(validator.validate('true', booleanSchema).valid).toBeFalsy();
    
    // Object validation
    const objectSchema = { type: 'object' };
    expect(validator.validate({}, objectSchema).valid).toBeTruthy();
    expect(validator.validate([], objectSchema).valid).toBeFalsy();
    
    // Array validation
    const arraySchema = { type: 'array' };
    expect(validator.validate([], arraySchema).valid).toBeTruthy();
    expect(validator.validate({}, arraySchema).valid).toBeFalsy();
    
    // Null validation
    const nullSchema = { type: 'null' };
    expect(validator.validate(null, nullSchema).valid).toBeTruthy();
    expect(validator.validate(undefined, nullSchema).valid).toBeFalsy();
  });
  
  test('should validate required properties', async () => {
    const schema = {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        age: { type: 'number' }
      }
    };
    
    // Valid object with all required properties
    const validObj = { name: 'John', email: 'john@example.com', age: 30 };
    const validResult = validator.validate(validObj, schema);
    expect(validResult.valid).toBeTruthy();
    expect(validResult.errors).toHaveLength(0);
    
    // Invalid object missing required property
    const invalidObj = { name: 'John', age: 30 };
    const invalidResult = validator.validate(invalidObj, schema);
    expect(invalidResult.valid).toBeFalsy();
    expect(invalidResult.errors).toHaveLength(1);
    expect(invalidResult.errors[0].message).toContain('Missing required property: email');
  });
  
  test('should validate nested objects', async () => {
    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' }
              }
            }
          }
        }
      }
    };
    
    // Valid nested object
    const validObj = {
      user: {
        id: 1,
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      }
    };
    
    const validResult = validator.validate(validObj, schema);
    expect(validResult.valid).toBeTruthy();
    
    // Invalid nested object (wrong type in nested property)
    const invalidObj = {
      user: {
        id: '1', // Should be number
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      }
    };
    
    const invalidResult = validator.validate(invalidObj, schema);
    expect(invalidResult.valid).toBeFalsy();
    expect(invalidResult.errors[0].path).toBe('user.id');
  });
  
  test('should validate arrays and array items', async () => {
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      }
    };
    
    // Valid array
    const validArray = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    
    const validResult = validator.validate(validArray, schema);
    expect(validResult.valid).toBeTruthy();
    
    // Invalid array (item with wrong type)
    const invalidArray = [
      { id: 1, name: 'Item 1' },
      { id: '2', name: 'Item 2' } // id should be number
    ];
    
    const invalidResult = validator.validate(invalidArray, schema);
    expect(invalidResult.valid).toBeFalsy();
    expect(invalidResult.errors[0].path).toBe('[1].id');
  });
  
  test('should validate string formats', async () => {
    // Email format
    const emailSchema = {
      type: 'string',
      format: 'email'
    };
    
    expect(validator.validate('user@example.com', emailSchema).valid).toBeTruthy();
    expect(validator.validate('invalid-email', emailSchema).valid).toBeFalsy();
    
    // Date-time format
    const dateTimeSchema = {
      type: 'string',
      format: 'date-time'
    };
    
    expect(validator.validate('2023-01-01T12:00:00Z', dateTimeSchema).valid).toBeTruthy();
    expect(validator.validate('2023-01-01', dateTimeSchema).valid).toBeFalsy();
    
    // URI format
    const uriSchema = {
      type: 'string',
      format: 'uri'
    };
    
    expect(validator.validate('https://example.com', uriSchema).valid).toBeTruthy();
    expect(validator.validate('not a url', uriSchema).valid).toBeFalsy();
  });
  
  test('should return detailed error information', async () => {
    const schema = {
      type: 'object',
      required: ['name', 'email', 'age'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        age: { type: 'number' }
      }
    };
    
    const invalidObj = {
      name: 123, // Wrong type
      email: 'invalid-email', // Invalid format
      // Missing age
    };
    
    const result = validator.validate(invalidObj, schema);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toHaveLength(3);
    
    // Check error details
    const errorMessages = result.errors.map(e => e.message);
    expect(errorMessages).toContain('Expected type string but got number');
    expect(errorMessages).toContain('Invalid format: email');
    expect(errorMessages).toContain('Missing required property: age');
  });
});