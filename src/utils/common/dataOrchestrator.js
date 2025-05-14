// src/utils/common/dataOrchestrator.js

/**
 * Unified data loader for hybrid or API testing.
 * Supports: YAML, XML, Excel (XLSX), and ENV values.
 * Used by test cases to load consistent, parameterized test data.
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { XMLParser } = require('fast-xml-parser');
const ExcelJS = require('exceljs');

// Default file paths are configurable via .env or hardcoded fallback
const YAML_PATH = process.env.YAML_TEST_DATA || 'src/data/testData.yaml';
const EXCEL_PATH = process.env.EXCEL_TEST_DATA || 'src/data/testData.xlsx';

/**
 * Reads and parses a YAML file from disk.
 * Used for generic key-value driven test data.
 */
function readYaml(filePath = YAML_PATH) {
  try {
    const resolved = path.resolve(filePath);
    const raw = fs.readFileSync(resolved, 'utf8');
    return yaml.load(raw);
  } catch (error) {
    console.warn(`Failed to read YAML file ${filePath}: ${error.message}`);
    return {};
  }
}

/**
 * Reads and parses an XML file into JSON.
 * Useful for legacy system integrations or contract validation.
 */
function readXml(filePath) {
  try {
    const resolved = path.resolve(filePath);
    const raw = fs.readFileSync(resolved, 'utf8');
    const parser = new XMLParser();
    return parser.parse(raw);
  } catch (error) {
    console.warn(`Failed to read XML file ${filePath}: ${error.message}`);
    return {};
  }
}

/**
 * Loads and validates an Excel file (.xlsx).
 * Returns parsed rows as objects using the first sheet.
 */
async function readExcel(filePath = EXCEL_PATH, requiredHeaders = ['name', 'job', 'email']) {
  try {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      throw new Error(`Excel file not found: ${resolved}`);
    }

    const stats = fs.statSync(resolved);
    if (stats.size < 1024) {
      throw new Error(`Excel file is too small or invalid: ${resolved}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(resolved);

    const sheet = workbook.getWorksheet(1);
    if (!sheet || sheet.rowCount <= 1) {
      throw new Error(`Excel sheet is missing or contains no data: ${resolved}`);
    }

    const rows = [];
    let headers = [];

    sheet.eachRow({ includeEmpty: false }, (row, index) => {
      if (index === 1) {
        headers = row.values.slice(1); // skip first empty index
        const missing = requiredHeaders.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          throw new Error(`Excel headers missing: ${missing.join(', ')}`);
        }
        return;
      }

      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
        if (colIndex <= headers.length) {
          rowData[headers[colIndex - 1]] = cell.value;
        }
      });
      rows.push(rowData);
    });

    if (rows.length === 0) {
      throw new Error(`Excel file contains no valid data rows: ${resolved}`);
    }

    return rows;
  } catch (error) {
    console.warn(`Failed to read Excel file ${filePath}: ${error.message}`);
    // Return a default row with the required headers
    return [requiredHeaders.reduce((obj, header) => {
      obj[header] = `Default ${header}`;
      return obj;
    }, {})];
  }
}

/**
 * Combines test data from multiple sources:
 * - .env values (like LOGIN_USERNAME)
 * - YAML (e.g., name, job)
 * - Excel (e.g., test matrix)
 */
async function getHybridTestData() {
  const envData = {
    username: process.env.LOGIN_USERNAME || 'default_username',
    password: process.env.LOGIN_PASSWORD || 'default_password'
  };

  let yamlData = {};
  try {
    yamlData = readYaml();
    if (!yamlData.user) {
      yamlData.user = {
        name: 'Default User',
        job: 'Default Job',
        email: 'default.user@example.com'
      };
    }
  } catch (error) {
    console.warn('YAML data could not be loaded:', error.message);
    yamlData = {
      user: {
        name: 'Default User',
        job: 'Default Job',
        email: 'default.user@example.com'
      }
    };
  }

  let excelData = {};
  try {
    excelData = (await readExcel())[0]; // only take first row for test
  } catch (error) {
    console.warn('Excel data could not be loaded:', error.message);
  }

  return {
    ...envData,
    ...yamlData.user,
    ...excelData
  };
}

module.exports = {
  readYaml,
  readXml,
  readExcel,
  getHybridTestData
};