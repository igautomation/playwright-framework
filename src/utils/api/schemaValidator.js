const logger = require('../common/logger');

/**
 * Schema Validator for API response validation
 */
class SchemaValidator {
  constructor() {
    // We'll use a simple implementation since we don't want to add Ajv as a dependency yet
    this.schemas = new Map();
  }

  /**
   * Add a schema to the validator
   * @param {string} schemaName - Name of the schema
   * @param {Object} schema - JSON schema object
   */
  addSchema(schemaName, schema) {
    this.schemas.set(schemaName, schema);
    logger.info(`Schema added: ${schemaName}`);
  }

  /**
   * Validate data against a schema
   * @param {string} schemaName - Name of the schema
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  validate(schemaName, data) {
    if (!this.schemas.has(schemaName)) {
      throw new Error(`Schema not found: ${schemaName}`);
    }

    const schema = this.schemas.get(schemaName);
    const errors = this.validateAgainstSchema(schema, data);

    if (errors.length > 0) {
      logger.error(`Schema validation failed for ${schemaName}`, errors);
      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: true,
      errors: null,
    };
  }

  /**
   * Validate data against a schema (simple implementation)
   * @param {Object} schema - Schema object
   * @param {Object} data - Data to validate
   * @returns {Array} Validation errors
   */
  validateAgainstSchema(schema, data) {
    const errors = [];

    // Check required properties
    if (schema.required) {
      for (const prop of schema.required) {
        if (data[prop] === undefined) {
          errors.push(`Missing required property: ${prop}`);
        }
      }
    }

    // Check property types
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (data[prop] !== undefined) {
          // Check type
          if (propSchema.type) {
            const type = propSchema.type;
            const value = data[prop];

            if (type === 'string' && typeof value !== 'string') {
              errors.push(`Property ${prop} should be a string`);
            } else if (type === 'number' && typeof value !== 'number') {
              errors.push(`Property ${prop} should be a number`);
            } else if (type === 'boolean' && typeof value !== 'boolean') {
              errors.push(`Property ${prop} should be a boolean`);
            } else if (
              type === 'object' &&
              (typeof value !== 'object' || Array.isArray(value))
            ) {
              errors.push(`Property ${prop} should be an object`);
            } else if (type === 'array' && !Array.isArray(value)) {
              errors.push(`Property ${prop} should be an array`);
            }
          }

          // Check enum
          if (propSchema.enum && !propSchema.enum.includes(data[prop])) {
            errors.push(
              `Property ${prop} should be one of: ${propSchema.enum.join(', ')}`
            );
          }

          // Check format (simple implementation)
          if (propSchema.format === 'email' && typeof data[prop] === 'string') {
            if (!data[prop].includes('@')) {
              errors.push(`Property ${prop} should be a valid email`);
            }
          }
        }
      }
    }

    return errors;
  }

  /**
   * Get all registered schemas
   * @returns {Map} Map of schemas
   */
  getSchemas() {
    return this.schemas;
  }
}

module.exports = new SchemaValidator();
