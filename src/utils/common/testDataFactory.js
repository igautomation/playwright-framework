<<<<<<< HEAD
// src/utils/common/testDataFactory.js

/**
 * Test Data Factory Utility for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Generate random test data for UI and API testing
 * - Support JSON, YAML, and CSV data file operations
 * - Enable bulk test data creation for automation scripts
 */

import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import { parse as parseCsv } from 'csv-parse/sync';

/**
 * Generates random user data for tests.
 */
function generateUserData(overrides = {}) {
  if (typeof overrides !== 'object') {
    throw new Error('Overrides must be an object');
  }
  const getFirstName = () => faker.person?.firstName() || faker.name?.firstName();
  const getLastName = () => faker.person?.lastName() || faker.name?.lastName();

  const defaultData = {
    id: uuidv4(),
    firstName: getFirstName(),
    lastName: getLastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.internet.username()
  };

  return { ...defaultData, ...overrides };
}

/**
 * Generates random form input data for UI tests.
 */
function generateFormData(overrides = {}) {
  if (typeof overrides !== 'object') {
    throw new Error('Overrides must be an object');
  }
  const defaultData = {
    username: faker.internet.username(),
    password: faker.internet.password(8),
    email: faker.internet.email(),
    phone: faker.phone.number()
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generates random contact data.
 */
function generateContactData(overrides = {}) {
  if (typeof overrides !== 'object') {
    throw new Error('Overrides must be an object');
  }
  const timestamp = Date.now();
  const getFirstName = () => faker.person?.firstName() || faker.name?.firstName();
  const getLastName = () => faker.person?.lastName() || faker.name?.lastName();

  const defaultData = {
    FirstName: getFirstName(),
    LastName: getLastName(),
    Email: `test-${timestamp}@example.com`,
    Phone: faker.phone.number(),
    Title: 'Test Contact',
    Department: 'QA'
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generates random account data.
 */
function generateAccountData(overrides = {}) {
  if (typeof overrides !== 'object') {
    throw new Error('Overrides must be an object');
  }
  const timestamp = Date.now();
  const defaultData = {
    Name: `TestAccount${timestamp}`,
    Phone: faker.phone.number(),
    Industry: 'Technology',
    Type: 'Customer',
    Website: faker.internet.url()
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generates random opportunity data.
 */
function generateOpportunityData(overrides = {}) {
  if (typeof overrides !== 'object') {
    throw new Error('Overrides must be an object');
  }
  const timestamp = Date.now();
  const defaultData = {
    Name: `TestOpp${timestamp}`,
    StageName: 'Prospecting',
    CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    Amount: faker.finance.amount(1000, 10000)
  };
  return { ...defaultData, ...overrides };
}

/**
 * Loads test data from a file (JSON, YAML, or CSV).
 */
async function loadTestData(path) {
  try {
    const ext = path.split('.').pop().toLowerCase();
    const data = await fs.readFile(path, 'utf8');

    if (ext === 'json') {
      return JSON.parse(data);
    } else if (ext === 'yaml' || ext === 'yml') {
      return yaml.load(data);
    } else if (ext === 'csv') {
      return parseCsv(data, { columns: true, skip_empty_lines: true });
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  } catch (error) {
    console.error(`Failed to load test data from ${path}:`, error.message);
    throw error;
  }
}

/**
 * Generates multiple users and writes them to a JSON file.
 */
async function generateUsersToFile(count, outputPath) {
  try {
    const users = Array.from({ length: count }, () => generateUserData());
    await fs.writeFile(outputPath, JSON.stringify(users, null, 2));
  } catch (error) {
    throw new Error(`Failed to generate users file: ${error.message}`);
  }
}

/**
 * Generates multiple products and writes them to a CSV file.
 */
async function generateProductsToCsv(count, outputPath) {
  try {
    const products = Array.from({ length: count }, () => ({
      id: faker.number.int({ min: 1, max: 1000 }),
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 100 })
    }));

    const csvData = [
      'id,name,price,category,stock',
      ...products.map((p) => `${p.id},${p.name},${p.price},${p.category},${p.stock}`)
    ].join('\n');

    await fs.writeFile(outputPath, csvData);
  } catch (error) {
    throw new Error(`Failed to generate products CSV: ${error.message}`);
  }
}

export {
  generateUserData,
  generateFormData,
  generateContactData,
  generateAccountData,
  generateOpportunityData,
  loadTestData,
  generateUsersToFile,
  generateProductsToCsv
};
=======
const { faker } = require('@faker-js/faker');

/**
 * Test Data Factory for generating test data
 */
class TestDataFactory {
  /**
   * Generate user data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Generated user data
   */
  static generateUser(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .userName({ firstName, lastName })
      .toLowerCase();

    return {
      id: faker.number.int({ min: 1000, max: 9999 }),
      username,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      userStatus: faker.number.int({ min: 0, max: 1 }),
      ...overrides,
    };
  }

  /**
   * Generate employee data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Generated employee data
   */
  static generateEmployee(overrides = {}) {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const employeeId = faker.string.alphanumeric(5).toUpperCase();

    return {
      id: faker.number.int({ min: 1000, max: 9999 }),
      firstName,
      middleName,
      lastName,
      employeeId,
      jobTitle: faker.person.jobTitle(),
      status: faker.helpers.arrayElement(['Active', 'Terminated', 'On Leave']),
      subUnit: faker.helpers.arrayElement([
        'Administration',
        'Engineering',
        'Development',
        'QA',
        'Finance',
        'Sales',
        'Marketing',
        'Support',
      ]),
      supervisor: `${faker.person.firstName()} ${faker.person.lastName()}`,
      ...overrides,
    };
  }

  /**
   * Generate product data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Generated product data
   */
  static generateProduct(overrides = {}) {
    return {
      id: faker.number.int({ min: 1000, max: 9999 }),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
        faker.commerce.productAdjective()
      ),
      ...overrides,
    };
  }

  /**
   * Generate order data
   * @param {Object} overrides - Properties to override
   * @returns {Object} Generated order data
   */
  static generateOrder(overrides = {}) {
    const productCount = faker.number.int({ min: 1, max: 5 });
    const products = Array.from({ length: productCount }, () =>
      this.generateProduct()
    );

    return {
      id: faker.number.int({ min: 10000, max: 99999 }),
      userId: faker.number.int({ min: 1000, max: 9999 }),
      date: faker.date.recent().toISOString(),
      products,
      total: products.reduce((sum, product) => sum + product.price, 0),
      status: faker.helpers.arrayElement([
        'pending',
        'processing',
        'shipped',
        'delivered',
      ]),
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      ...overrides,
    };
  }

  /**
   * Generate dynamic API payload based on schema
   * @param {Object} schema - JSON schema
   * @param {Object} overrides - Properties to override
   * @returns {Object} Generated payload
   */
  static generatePayloadFromSchema(schema, overrides = {}) {
    const payload = {};

    // Process required fields first to ensure they're included
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        // Skip if already set by overrides
        if (overrides.hasOwnProperty(requiredField)) {
          payload[requiredField] = overrides[requiredField];
          continue;
        }

        // Get property schema for this required field
        const propSchema = schema.properties && schema.properties[requiredField];
        if (propSchema) {
          // Generate value based on property schema
          payload[requiredField] = this.generateValueForProperty(requiredField, propSchema);
        }
      }
    }

    // Process schema properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        // Skip if already processed as required or in overrides
        if (payload.hasOwnProperty(key) || overrides.hasOwnProperty(key)) {
          if (overrides.hasOwnProperty(key)) {
            payload[key] = overrides[key];
          }
          return;
        }

        // Generate value based on property schema
        payload[key] = this.generateValueForProperty(key, prop);
      });
    }

    // Apply any remaining overrides
    Object.entries(overrides).forEach(([key, value]) => {
      if (!payload.hasOwnProperty(key)) {
        payload[key] = value;
      }
    });

    return payload;
  }

  /**
   * Generate a value for a property based on its schema
   * @param {string} key - Property key
   * @param {Object} prop - Property schema
   * @returns {any} Generated value
   */
  static generateValueForProperty(key, prop) {
    // Generate value based on type
    switch (prop.type) {
      case 'string':
        if (prop.format === 'email') {
          return faker.internet.email();
        } else if (prop.format === 'date-time') {
          return faker.date.recent().toISOString();
        } else if (prop.format === 'uuid') {
          return faker.string.uuid();
        } else if (prop.enum) {
          return faker.helpers.arrayElement(prop.enum);
        } else {
          return faker.lorem.word();
        }
      case 'number':
      case 'integer':
        return faker.number.int({
          min: prop.minimum || 0,
          max: prop.maximum || 1000,
        });
      case 'boolean':
        // In newer versions of faker, boolean is under faker.datatype.boolean()
        // In version 8+, it's under faker.boolean.boolean()
        return typeof faker.boolean !== 'undefined' ? 
          faker.boolean.boolean() : 
          faker.datatype.boolean();
      case 'array':
        return Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          () => {
            if (prop.items.type === 'object') {
              return this.generatePayloadFromSchema(prop.items);
            } else if (prop.items.type === 'string') {
              return faker.lorem.word();
            } else if (
              prop.items.type === 'number' ||
              prop.items.type === 'integer'
            ) {
              return faker.number.int({ min: 0, max: 1000 });
            } else {
              return null;
            }
          }
        );
      case 'object':
        return this.generatePayloadFromSchema(prop);
      default:
        return null;
    }
  }
}

module.exports = TestDataFactory;
>>>>>>> 51948a2 (Main v1.0)
