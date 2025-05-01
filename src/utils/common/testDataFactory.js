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
    username: faker.internet.username(),
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
    phone: faker.phone.number(),
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
    Department: 'QA',
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
    Website: faker.internet.url(),
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
    Amount: faker.finance.amount(1000, 10000),
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
      stock: faker.number.int({ min: 0, max: 100 }),
    }));

    const csvData = [
      'id,name,price,category,stock',
      ...products.map((p) => `${p.id},${p.name},${p.price},${p.category},${p.stock}`),
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
  generateProductsToCsv,
};
