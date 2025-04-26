// src/utils/common/testDataFactory.js
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const csv = require('csv-parse/sync');

/**
 * Test data factory for generic web applications and Salesforce tests
 */

/**
 * Generate random user data for UI/API testing
 * @param {Object} [overrides] - Fields to override (id, firstName, lastName, email, password, username)
 * @returns {Object} User data
 * @throws {Error} If overrides contain invalid types
 */
function generateUserData(overrides = {}) {
  if (typeof overrides !== 'object') throw new Error('Overrides must be an object');
  const defaultData = {
    id: uuidv4(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.internet.userName(),
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generate random form input data for UI testing
 * @param {Object} [overrides] - Fields to override (username, password, email, phone)
 * @returns {Object} Form input data
 * @throws {Error} If overrides contain invalid types
 */
function generateFormData(overrides = {}) {
  if (typeof overrides !== 'object') throw new Error('Overrides must be an object');
  const defaultData = {
    username: faker.internet.userName(),
    password: faker.internet.password(8),
    email: faker.internet.email(),
    phone: faker.phone.number(),
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generate random contact data (Salesforce-specific)
 * @param {Object} [overrides] - Fields to override (FirstName, LastName, Email, Phone, Title, Department)
 * @returns {Object} Contact data
 * @throws {Error} If overrides contain invalid types
 */
function generateContactData(overrides = {}) {
  if (typeof overrides !== 'object') throw new Error('Overrides must be an object');
  const timestamp = Date.now();
  const defaultData = {
    FirstName: faker.person.firstName(),
    LastName: faker.person.lastName(),
    Email: `test-${timestamp}@example.com`,
    Phone: faker.phone.number(),
    Title: 'Test Contact',
    Department: 'QA',
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generate random account data (Salesforce-specific)
 * @param {Object} [overrides] - Fields to override (Name, Phone, Industry, Type, Website)
 * @returns {Object} Account data
 * @throws {Error} If overrides contain invalid types
 */
function generateAccountData(overrides = {}) {
  if (typeof overrides !== 'object') throw new Error('Overrides must be an object');
  const timestamp = Date.now();
  const defaultData = {
    Name: `TestAccount${timestamp}`,
    Phone: faker.phone.number(),
    Industry: 'Technology',
    Type: 'Customer',
    Website: faker.internet.url(),
  };
  return { ...defaultData, ...overrides };
}

/**
 * Generate random opportunity data (Salesforce-specific)
 * @param {Object} [overrides] - Fields to override (Name, StageName, CloseDate, Amount)
 * @returns {Object} Opportunity data
 * @throws {Error} If overrides contain invalid types
 */
function generateOpportunityData(overrides = {}) {
  if (typeof overrides !== 'object') throw new Error('Overrides must be an object');
  const timestamp = Date.now();
  const defaultData = {
    Name: `TestOpp${timestamp}`,
    StageName: 'Prospecting',
    CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    Amount: faker.finance.amount(1000, 10000),
  };
  return { ...defaultData, ...overrides };
}

/**
 * Load test data from JSON, YAML, or CSV file
 * @param {string} path - Path to file
 * @returns {Promise<Object|Array>} Test data
 * @throws {Error} If file loading or parsing fails
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
      return csv.parse(data, { columns: true, skip_empty_lines: true });
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  } catch (error) {
    console.error(`Failed to load test data from ${path}:`, error.message);
    throw error;
  }
}

module.exports = {
  generateUserData,
  generateFormData,
  generateContactData,
  generateAccountData,
  generateOpportunityData,
  loadTestData,
};