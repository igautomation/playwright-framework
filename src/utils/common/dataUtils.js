// src/utils/common/dataUtils.js
const fs = require('fs').promises;
const yaml = require('js-yaml');
const csv = require('csv-parse/sync');

const cache = new Map();

const parsers = {
  json: (data) => JSON.parse(data),
  yaml: (data) => yaml.load(data),
  yml: (data) => yaml.load(data),
  csv: (data, path) => {
    const parsed = csv.parse(data, { columns: true, skip_empty_lines: true });
    if (parsed.length === 0) throw new Error(`CSV file ${path} is empty`);
    const headers = Object.keys(parsed[0]);
    const requiredHeaders = {
      'src/data/csv/users.csv': ['username', 'password'],
      'src/data/csv/products.csv': ['id', 'name', 'price'],
    };
    const required = requiredHeaders[path] || [];
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length > 0) {
      throw new Error(`Missing required headers in ${path}: ${missing.join(', ')}`);
    }
    return parsed;
  },
};

/**
 * Reads data from JSON, YAML, or CSV files
 * @param {string} path - File path
 * @returns {Promise} Resolves to parsed data
 * @throws {Error} If file reading or parsing fails
 */
async function readData(path) {
  try {
    if (cache.has(path)) return cache.get(path);
    const ext = path.split('.').pop().toLowerCase();
    const parser = parsers[ext];
    if (!parser) throw new Error(`Unsupported file format: ${ext}`);
    const data = await fs.readFile(path, 'utf8');
    const result = parser(data, path);
    cache.set(path, result);
    return result;
  } catch (error) {
    throw new Error(`Failed to read data from ${path}: ${error.message}`);
  }
}

module.exports = { readData };