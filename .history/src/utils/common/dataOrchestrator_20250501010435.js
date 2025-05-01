// src/utils/common/dataOrchestrator.js

/**
 * Unified data loader for hybrid or API testing.
 * Supports: YAML, XML, Excel (XLSX), and ENV values.
 * Used by test cases to load consistent, parameterized test data.
 */

import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import ExcelJS from "exceljs";
import DBUtils from "../database/dbUtils.js";

// Default file paths are configurable via .env or hardcoded fallback
const YAML_PATH = process.env.YAML_TEST_DATA || "src/data/testData.yaml";
const EXCEL_PATH = process.env.EXCEL_TEST_DATA || "src/data/testData.xlsx";

/**
 * Reads and parses a YAML file from disk.
 * Used for generic key-value driven test data.
 */
function readYaml(filePath = YAML_PATH) {
  const resolved = path.resolve(filePath);
  const raw = fs.readFileSync(resolved, "utf8");
  return yaml.load(raw);
}

/**
 * Reads and parses an XML file into JSON.
 * Useful for legacy system integrations or contract validation.
 */
function readXml(filePath) {
  const resolved = path.resolve(filePath);
  const raw = fs.readFileSync(resolved, "utf8");
  const parser = new XMLParser();
  return parser.parse(raw);
}

/**
 * Loads and validates an Excel file (.xlsx).
 * Returns parsed rows as objects using the first sheet.
 */
async function readExcel(
  filePath = EXCEL_PATH,
  requiredHeaders = ["name", "job", "email"]
) {
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
        throw new Error(`Excel headers missing: ${missing.join(", ")}`);
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
}

/**
 * Combines test data from multiple sources:
 * - .env values (like LOGIN_USERNAME)
 * - YAML (e.g., name, job)
 * - Excel (e.g., test matrix)
 * - Database (e.g., user lookup)
 */
async function getHybridTestData() {
  const envData = {
    username: process.env.LOGIN_USERNAME,
    password: process.env.LOGIN_PASSWORD,
  };

  const yamlData = readYaml();
  const excelData = (await readExcel())[0]; // only take first row for test

  const db = new DBUtils();
  await db.connect();
  const dbUser = await db.getUserByEmail(excelData.email);
  await db.disconnect();

  return {
    ...envData,
    ...yamlData.user,
    ...excelData,
    dbUser,
  };
}

export { readYaml, readXml, readExcel, getHybridTestData };
