
/**
 * Test data factory for generating test data
 */
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class TestDataFactory {
  /**
   * Generate random user data
   * @param {Object} options - User data options
   * @returns {Object} User data
   */
  static generateUser(options = {}) {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();
    const email = options.email || faker.internet.email({ firstName, lastName });
    
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      username: options.username || faker.internet.userName({ firstName, lastName }),
      firstName,
      lastName,
      email,
      password: options.password || faker.internet.password(),
      phone: options.phone || faker.phone.number(),
      userStatus: options.userStatus || faker.number.int({ min: 0, max: 1 })
    };
  }
  
  /**
   * Generate employee data
   * @param {Object} options - Employee data options
   * @returns {Object} Employee data
   */
  static generateEmployee(options = {}) {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();
    const email = options.email || faker.internet.email({ firstName, lastName });
    
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      firstName,
      lastName,
      email,
      employeeId: options.employeeId || `EMP-${faker.number.int({ min: 10000, max: 99999 })}`,
      joinDate: options.joinDate || faker.date.past(),
      department: options.department || faker.helpers.arrayElement(['HR', 'IT', 'Finance', 'Marketing', 'Operations']),
      position: options.position || faker.person.jobTitle(),
      salary: options.salary || faker.number.int({ min: 30000, max: 150000 }),
      status: options.status || faker.helpers.arrayElement(['Active', 'On Leave', 'Terminated'])
    };
  }

  /**
   * Generate multiple users
   * @param {number} count - Number of users to generate
   * @param {Object} options - User data options
   * @returns {Array<Object>} Array of user data
   */
  static generateUsers(count, options = {}) {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      users.push(this.generateUser(options));
    }
    
    return users;
  }

  /**
   * Generate random product data
   * @param {Object} options - Product data options
   * @returns {Object} Product data
   */
  static generateProduct(options = {}) {
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      name: options.name || faker.commerce.productName(),
      description: options.description || faker.commerce.productDescription(),
      price: options.price || parseFloat(faker.commerce.price()),
      category: options.category || faker.commerce.department(),
      image: options.image || faker.image.url(),
      rating: options.rating || {
        rate: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        count: faker.number.int({ min: 1, max: 1000 })
      }
    };
  }

  /**
   * Generate multiple products
   * @param {number} count - Number of products to generate
   * @param {Object} options - Product data options
   * @returns {Array<Object>} Array of product data
   */
  static generateProducts(count, options = {}) {
    const products = [];
    
    for (let i = 0; i < count; i++) {
      products.push(this.generateProduct(options));
    }
    
    return products;
  }

  /**
   * Generate random order data
   * @param {Object} options - Order data options
   * @returns {Object} Order data
   */
  static generateOrder(options = {}) {
    const products = options.products || [
      this.generateProduct(),
      this.generateProduct()
    ];
    
    const total = products.reduce((sum, product) => sum + product.price, 0);
    
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      userId: options.userId || faker.number.int({ min: 1, max: 1000 }),
      date: options.date || faker.date.recent(),
      products,
      total: options.total || total,
      status: options.status || faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered'])
    };
  }

  /**
   * Generate payload from JSON schema
   * @param {Object} schema - JSON schema
   * @param {Object} overrides - Property overrides
   * @returns {Object} Generated payload
   */
  static generatePayloadFromSchema(schema, overrides = {}) {
    const payload = {};
    
    // Process properties from schema
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        // If override exists, use it
        if (overrides[propName] !== undefined) {
          payload[propName] = overrides[propName];
          continue;
        }
        
        // Generate value based on type
        switch (propSchema.type) {
          case 'string':
            if (propSchema.format === 'email') {
              payload[propName] = faker.internet.email();
            } else if (propSchema.format === 'date-time') {
              payload[propName] = faker.date.recent().toISOString();
            } else if (propSchema.format === 'uri') {
              payload[propName] = faker.internet.url();
            } else if (propSchema.enum) {
              payload[propName] = faker.helpers.arrayElement(propSchema.enum);
            } else {
              payload[propName] = faker.lorem.word();
            }
            break;
            
          case 'number':
          case 'integer':
            if (propSchema.enum) {
              payload[propName] = faker.helpers.arrayElement(propSchema.enum);
            } else {
              const min = propSchema.minimum || 0;
              const max = propSchema.maximum || 1000;
              payload[propName] = propSchema.type === 'integer' 
                ? faker.number.int({ min, max })
                : faker.number.float({ min, max, precision: 0.01 });
            }
            break;
            
          case 'boolean':
            payload[propName] = faker.datatype.boolean();
            break;
            
          case 'array':
            const minItems = propSchema.minItems || 1;
            const maxItems = propSchema.maxItems || 5;
            const itemCount = faker.number.int({ min: minItems, max: maxItems });
            payload[propName] = [];
            
            for (let i = 0; i < itemCount; i++) {
              if (propSchema.items && propSchema.items.type) {
                payload[propName].push(
                  this.generateValueForType(propSchema.items.type, propSchema.items)
                );
              } else {
                payload[propName].push(faker.lorem.word());
              }
            }
            break;
            
          case 'object':
            if (propSchema.properties) {
              payload[propName] = this.generatePayloadFromSchema(propSchema);
            } else {
              payload[propName] = {
                id: faker.number.int({ min: 1, max: 1000 }),
                name: faker.lorem.word()
              };
            }
            break;
            
          default:
            payload[propName] = null;
        }
      }
    }
    
    // Ensure all required fields are present
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (payload[requiredProp] === undefined) {
          // If a required property wasn't set, generate a value for it
          const propSchema = schema.properties[requiredProp];
          if (propSchema) {
            payload[requiredProp] = this.generateValueForType(propSchema.type, propSchema);
          } else {
            // Default to string if no schema is defined
            payload[requiredProp] = faker.lorem.word();
          }
        }
      }
    }
    
    return payload;
  }
  
  /**
   * Generate a value for a specific type
   * @param {string} type - Data type
   * @param {Object} schema - Property schema
   * @returns {any} Generated value
   */
  static generateValueForType(type, schema = {}) {
    switch (type) {
      case 'string':
        if (schema.format === 'email') {
          return faker.internet.email();
        } else if (schema.format === 'date-time') {
          return faker.date.recent().toISOString();
        } else if (schema.format === 'uri') {
          return faker.internet.url();
        } else if (schema.enum) {
          return faker.helpers.arrayElement(schema.enum);
        }
        return faker.lorem.word();
        
      case 'number':
      case 'integer':
        if (schema.enum) {
          return faker.helpers.arrayElement(schema.enum);
        }
        const min = schema.minimum || 0;
        const max = schema.maximum || 1000;
        return type === 'integer' 
          ? faker.number.int({ min, max })
          : faker.number.float({ min, max, precision: 0.01 });
        
      case 'boolean':
        return faker.datatype.boolean();
        
      case 'array':
        const minItems = schema.minItems || 1;
        const maxItems = schema.maxItems || 3;
        const itemCount = faker.number.int({ min: minItems, max: maxItems });
        const array = [];
        
        for (let i = 0; i < itemCount; i++) {
          if (schema.items && schema.items.type) {
            array.push(this.generateValueForType(schema.items.type, schema.items));
          } else {
            array.push(faker.lorem.word());
          }
        }
        return array;
        
      case 'object':
        if (schema.properties) {
          return this.generatePayloadFromSchema(schema);
        }
        return {
          id: faker.number.int({ min: 1, max: 1000 }),
          name: faker.lorem.word()
        };
        
      default:
        return null;
    }
  }

  /**
   * Save test data to file
   * @param {Object|Array} data - Data to save
   * @param {string} filename - Filename
   * @returns {string} File path
   */
  static saveToFile(data, filename) {
    const dataDir = path.join(process.cwd(), 'test-data');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    logger.info(`Test data saved to ${filePath}`);
    return filePath;
  }

  /**
   * Load test data from file
   * @param {string} filename - Filename
   * @returns {Object|Array} Loaded data
   */
  static loadFromFile(filename) {
    const filePath = path.join(process.cwd(), 'test-data', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    logger.info(`Test data loaded from ${filePath}`);
    
    return data;
  }
}

module.exports = TestDataFactory;