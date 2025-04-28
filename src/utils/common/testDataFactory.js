// src/utils/common/testDataFactory.js

/**
 * Test Data Factory Utility for Playwright Framework.
 *
 * Responsibilities:
 * - Generate random test data for UI and API testing
 * - Support JSON, YAML, and CSV data file operations
 * - Enable bulk test data creation for automation scripts
 */

const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const yaml = require("js-yaml");
const csv = require("csv-parse/sync");

/**
 * Generates random user data for tests.
 *
 * @param {Object} [overrides] - Fields to override.
 * @returns {Object} - Generated user data.
 */
function generateUserData(overrides = {}) {
  if (typeof overrides !== "object") {
    throw new Error("Overrides must be an object");
  }
  try {
    const getFirstName = () =>
      faker.person?.firstName() || faker.name?.firstName();
    const getLastName = () =>
      faker.person?.lastName() || faker.name?.lastName();

    const defaultData = {
      id: uuidv4(),
      firstName: getFirstName(),
      lastName: getLastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: faker.internet.username(),
    };

    return { ...defaultData, ...overrides };
  } catch (error) {
    throw new Error(`Failed to generate user data: ${error.message}`);
  }
}

/**
 * Generates random form input data for UI tests.
 *
 * @param {Object} [overrides] - Fields to override.
 * @returns {Object} - Generated form data.
 */
function generateFormData(overrides = {}) {
  if (typeof overrides !== "object") {
    throw new Error("Overrides must be an object");
  }
  try {
    const defaultData = {
      username: faker.internet.username(),
      password: faker.internet.password(8),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };

    return { ...defaultData, ...overrides };
  } catch (error) {
    throw new Error(`Failed to generate form data: ${error.message}`);
  }
}

/**
 * Generates random contact data.
 *
 * @param {Object} [overrides] - Fields to override.
 * @returns {Object} - Generated contact data.
 */
function generateContactData(overrides = {}) {
  if (typeof overrides !== "object") {
    throw new Error("Overrides must be an object");
  }
  try {
    const timestamp = Date.now();
    const getFirstName = () =>
      faker.person?.firstName() || faker.name?.firstName();
    const getLastName = () =>
      faker.person?.lastName() || faker.name?.lastName();

    const defaultData = {
      FirstName: getFirstName(),
      LastName: getLastName(),
      Email: `test-${timestamp}@example.com`,
      Phone: faker.phone.number(),
      Title: "Test Contact",
      Department: "QA",
    };

    return { ...defaultData, ...overrides };
  } catch (error) {
    throw new Error(`Failed to generate contact data: ${error.message}`);
  }
}

/**
 * Generates random account data.
 *
 * @param {Object} [overrides] - Fields to override.
 * @returns {Object} - Generated account data.
 */
function generateAccountData(overrides = {}) {
  if (typeof overrides !== "object") {
    throw new Error("Overrides must be an object");
  }
  try {
    const timestamp = Date.now();
    const defaultData = {
      Name: `TestAccount${timestamp}`,
      Phone: faker.phone.number(),
      Industry: "Technology",
      Type: "Customer",
      Website: faker.internet.url(),
    };

    return { ...defaultData, ...overrides };
  } catch (error) {
    throw new Error(`Failed to generate account data: ${error.message}`);
  }
}

/**
 * Generates random opportunity data.
 *
 * @param {Object} [overrides] - Fields to override.
 * @returns {Object} - Generated opportunity data.
 */
function generateOpportunityData(overrides = {}) {
  if (typeof overrides !== "object") {
    throw new Error("Overrides must be an object");
  }
  try {
    const timestamp = Date.now();
    const defaultData = {
      Name: `TestOpp${timestamp}`,
      StageName: "Prospecting",
      CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      Amount: faker.finance.amount(1000, 10000),
    };

    return { ...defaultData, ...overrides };
  } catch (error) {
    throw new Error(`Failed to generate opportunity data: ${error.message}`);
  }
}

/**
 * Loads test data from a file (JSON, YAML, or CSV).
 *
 * @param {string} path - File path.
 * @returns {Promise<Object|Array>} - Parsed test data.
 */
async function loadTestData(path) {
  try {
    const ext = path.split(".").pop().toLowerCase();
    const data = await fs.readFile(path, "utf8");

    if (ext === "json") {
      return JSON.parse(data);
    } else if (ext === "yaml" || ext === "yml") {
      return yaml.load(data);
    } else if (ext === "csv") {
      return csv.parse(data, { columns: true, skip_empty_lines: true });
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
 *
 * @param {number} count - Number of users to generate.
 * @param {string} outputPath - Output file path.
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
 *
 * @param {number} count - Number of products to generate.
 * @param {string} outputPath - Output file path.
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
      "id,name,price,category,stock",
      ...products.map(
        (p) => `${p.id},${p.name},${p.price},${p.category},${p.stock}`
      ),
    ].join("\n");

    await fs.writeFile(outputPath, csvData);
  } catch (error) {
    throw new Error(`Failed to generate products CSV: ${error.message}`);
  }
}

module.exports = {
  generateUserData,
  generateFormData,
  generateContactData,
  generateAccountData,
  generateOpportunityData,
  loadTestData,
  generateUsersToFile,
  generateProductsToCsv,
};
