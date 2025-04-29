// src/utils/common/dataOrchestrator.js

const fs = require('fs');
const yaml = require('js-yaml');
const { XMLParser } = require('fast-xml-parser');
const xlsx = require('xlsx');
const DBUtils = require('@utils/database/dbUtils');

function readYaml(path) {
  const file = fs.readFileSync(path, 'utf8');
  return yaml.load(file);
}

function readXml(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const parser = new XMLParser();
  return parser.parse(raw);
}

function readExcel(path) {
  const workbook = xlsx.readFile(path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}

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

module.exports = {
  readYaml,
  readXml,
  readExcel,
  getHybridTestData
};
