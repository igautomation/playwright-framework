// src/utils/common/dataOrchestrator.js
import { readFileSync } from "fs";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import ExcelJS from "exceljs";
import DBUtils from "../database/dbUtils.js";

/**
 * Reads YAML file and parses it.
 * @param {string} path - File path to YAML file.
 * @returns {object} Parsed YAML data.
 */
function readYaml(path) {
  const file = readFileSync(path, "utf8");
  return yaml.load(file);
}

/**
 * Reads XML file and parses it.
 * @param {string} path - File path to XML file.
 * @returns {object} Parsed XML data.
 */
function readXml(path) {
  const raw = readFileSync(path, "utf8");
  const parser = new XMLParser();
  return parser.parse(raw);
}

/**
 * Reads Excel file and parses it.
 * @param {string} path - File path to Excel (.xlsx) file.
 * @returns {Array<object>} Parsed Excel sheet as JSON array.
 */
async function readExcel(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Excel file not found at path: ${path}`);
  }

  if (path.toLowerCase().indexOf(".xlsx") === -1) {
    throw new Error(`Invalid file extension: ${path}. Expected .xlsx`);
  }

  const stats = fs.statSync(path);
  if (stats.size === 0) {
    throw new Error(`Excel file is empty: ${path}`);
  }
  if (stats.size < 1024) {
    throw new Error(
      `Excel file is too small and likely invalid: ${path}. Ensure it is a valid .xlsx file.`
    );
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error(`No worksheet found in Excel file: ${path}`);
    }
    if (worksheet.rowCount <= 1) {
      throw new Error(
        `Excel file contains no data rows (only headers or empty): ${path}`
      );
    }

    const rows = [];
    let headers = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.slice(1); // Skip first cell (index 0)
        if (
          !headers.includes("name") ||
          !headers.includes("job") ||
          !headers.includes("email")
        ) {
          throw new Error(
            `Excel file missing required headers (name, job, email): ${path}`
          );
        }
        return;
      }
      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= headers.length) {
          rowData[headers[colNumber - 1]] = cell.value;
        }
      });
      rows.push(rowData);
    });

    if (rows.length === 0) {
      throw new Error(`Excel file contains no valid data rows: ${path}`);
    }

    return rows;
  } catch (error) {
    throw new Error(
      `Failed to read Excel file: ${error.message}. Ensure the file is a valid .xlsx, not corrupted, and contains required headers (name, job, email).`
    );
  }
}

/**
 * Aggregates hybrid test data from ENV, YAML, Excel, and Database.
 * @returns {Promise<object>} Consolidated test data.
 */
async function getHybridTestData() {
  const envData = {
    envUsername: process.env.LOGIN_USERNAME,
    envPassword: process.env.LOGIN_PASSWORD,
  };

  const yamlData = readYaml("src/data/testData.yaml");
  const excelData = (await readExcel("src/data/testData.xlsx"))[0];

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
