/**
 * Schema Validator
 * 
 * Provides utilities for validating JSON schemas
 */

/**
 * Schema Validator class
 */
class SchemaValidator {
  /**
   * Constructor
   */
  constructor() {
    // Simple type validation
    this.typeValidators = {
      string: (value) => typeof value === 'string',
      number: (value) => typeof value === 'number',
      boolean: (value) => typeof value === 'boolean',
      object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
      array: (value) => Array.isArray(value),
      null: (value) => value === null
    };
    
    // Format validators
    this.formatValidators = {
      'date-time': (value) => {
        const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
        return regex.test(value);
      },
      'email': (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
      },
      'uri': (value) => {
        try {
          new URL(value);
          return true;
        } catch (e) {
          return false;
        }
      }
    };
  }
  
  /**
   * Validate data against schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - JSON schema
   * @returns {Object} Validation result
   */
  validate(data, schema) {
    const errors = [];
    
    this._validateAgainstSchema(data, schema, '', errors);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate data against schema recursively
   * @param {*} data - Data to validate
   * @param {Object} schema - Schema to validate against
   * @param {string} path - Current path
   * @param {Array} errors - Errors array
   * @private
   */
  _validateAgainstSchema(data, schema, path, errors) {
    // Check type
    if (schema.type) {
      const typeValidator = this.typeValidators[schema.type];
      if (typeValidator && !typeValidator(data)) {
        errors.push({
          path,
          message: `Expected type ${schema.type} but got ${typeof data}`
        });
        return;
      }
    }
    
    // Check required properties
    if (schema.required && schema.properties) {
      for (const requiredProp of schema.required) {
        if (data[requiredProp] === undefined) {
          errors.push({
            path: path ? `${path}.${requiredProp}` : requiredProp,
            message: `Missing required property: ${requiredProp}`
          });
        }
      }
    }
    
    // Check properties
    if (schema.properties && typeof data === 'object' && data !== null) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (data[propName] !== undefined) {
          this._validateAgainstSchema(
            data[propName],
            propSchema,
            path ? `${path}.${propName}` : propName,
            errors
          );
        }
      }
    }
    
    // Check array items
    if (schema.type === 'array' && schema.items && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        this._validateAgainstSchema(
          data[i],
          schema.items,
          `${path}[${i}]`,
          errors
        );
      }
    }
    
    // Check format
    if (schema.format && typeof data === 'string') {
      const formatValidator = this.formatValidators[schema.format];
      if (formatValidator && !formatValidator(data)) {
        errors.push({
          path,
          message: `Invalid format: ${schema.format}`
        });
      }
    }
  }
}

module.exports = {
  SchemaValidator
};