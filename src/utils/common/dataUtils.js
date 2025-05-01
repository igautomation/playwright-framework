// src/utils/common/dataUtils.js

/**
 * Data Utilities for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Read and parse data from JSON, YAML, and CSV files
 * - Validate CSV headers where necessary
 * - Cache parsed data to improve performance
 */

import { promises as fs } from "fs";
import yaml from "js-yaml";
import { parse as parseCsv } from "csv-parse/sync";

// In-memory cache to avoid redundant file reads
const cache = new Map();

// Available parsers based on file extension
const parsers = {
  json: (data) => JSON.parse(data),
  yaml: (data) => yaml.load(data),
  yml: (data) => yaml.load(data),
  csv: (data, path) => {
    const parsed = parseCsv(data, { columns: true, skip_empty_lines: true });

    if (parsed.length === 0) {
      throw new Error(`CSV file ${path} is empty`);
    }

    const headers = Object.keys(parsed[0]);
    const requiredHeaders = {
      "src/data/csv/users.csv": ["username", "password"],
      "src/data/csv/products.csv": ["id", "name", "price"],
    };
    const required = requiredHeaders[path] || [];
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length > 0) {
      throw new Error(
        `Missing required headers in ${path}: ${missing.join(", ")}`
      );
    }

    return parsed;
  },
};

/**
 * Reads and parses data from a file.
 *
 * @param {string} path - Relative path to the data file.
 * @returns {Promise<any>} Resolves to parsed data object or array.
 * @throws {Error} If reading or parsing fails.
 */
async function readData(path) {
  try {
    if (cache.has(path)) {
      return cache.get(path);
    }

    const ext = path.split(".").pop().toLowerCase();
    const parser = parsers[ext];
    if (!parser) {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    const data = await fs.readFile(path, "utf8");
    const result = parser(data, path);

    cache.set(path, result);
    return result;
  } catch (error) {
    throw new Error(`Failed to read data from ${path}: ${error.message}`);
  }
}

export { readData };
