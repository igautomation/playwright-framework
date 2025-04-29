// src/utils/common/dataOrchestrator.js

import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';
import xlsx from 'xlsx';
import DBUtils from '../database/dbUtils.js';

/**
 * Reads YAML file and parses it.
 * @param {string} path - File path to YAML file.
 * @returns {object} Parsed YAML data.
 */
function readYaml(path) {
  const file = readFileSync(path, 'utf8');
  return yaml.load(file);
}

/**
 * Reads XML file and parses it.
 * @param {string} path - File path to XML file.
 * @returns {object} Parsed XML data.
 */
function readXml(path) {
  const raw = readFileSync(path, 'utf8');
  const parser = new XMLParser();
  return parser.parse(raw);
}

/**
 * Reads Excel file and parses it.
 * @param {string} path - File path to Excel (.xlsx) file.
 * @returns {Array<object>} Parsed Excel sheet as JSON array.
 */
function readExcel(path) {
  const workbook = xlsx.readFile(path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}

/**
 * Aggregates hybrid test data from ENV, YAML, Excel, and Database.
 * @returns {Promise<object>} Consolidated test data.
 */
async function getHybridTestData() {
  const envData = {
    envUsername: process.env.LOGIN_USERNAME,
    envPassword: process.env.LOGIN_PASSWORD
  };

  const yamlData = readYaml('src/data/testData.yaml');
  const excelData = readExcel('src/data/testData.xlsx')[0];

  const db = new DBUtils();
  await db.connect();
  const dbUser = await db.getUserByEmail(excelData.email);
  await db.disconnect();

  return {
    ...envData,
    ...yamlData.user,
    ...excelData,
    dbUser
  };
}

export {
  readYaml,
  readXml,
  readExcel,
  getHybridTestData
};