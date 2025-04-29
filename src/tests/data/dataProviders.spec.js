// src/tests/data/dataProviders.spec.js

import { test, expect } from '../../../fixtures/combined.js';
const { readData } = require('@utils/common/dataUtils');
const { readYaml, readXml, readExcel } = require('@utils/common/dataOrchestrator');
const DBUtils = require('@utils/database/dbUtils');

test.describe.parallel('Data Providers - Unified Test Suite', () => {

  test('Excel Data Test', async () => {
    const excelData = readExcel('src/data/testData.xlsx');
    for (const user of excelData) {
      console.log(`Excel: Name=${user.name}, Job=${user.job}, Email=${user.email}`);
      expect(user.name).not.toBeNull();
      expect(user.email).toContain('@');
    }
  });

  test('CSV Data Test', async () => {
    const csvData = await readData('src/data/testData.csv');
    for (const user of csvData) {
      console.log(`CSV: Name=${user.name}, Job=${user.job}, Email=${user.email}`);
      expect(user.name).not.toBeNull();
      expect(user.email).toContain('@');
    }
  });

  test('YAML Data Test', async () => {
    const yamlUser = readYaml('src/data/testData.yaml').user;
    console.log(`YAML: Name=${yamlUser.name}, Job=${yamlUser.job}, Email=${yamlUser.email}`);
    expect(yamlUser.name).not.toBeNull();
    expect(yamlUser.email).toContain('@');
  });

  test('XML Data Test', async () => {
    const xmlUser = readXml('src/data/testData.xml').user;
    console.log(`XML: Name=${xmlUser.name}, Job=${xmlUser.job}, Email=${xmlUser.email}`);
    expect(xmlUser.name).not.toBeNull();
    expect(xmlUser.email).toContain('@');
  });

  test('JSON Table Data Test', async () => {
    const jsonUsers = await readData('src/data/users.json');
    for (const user of jsonUsers) {
      console.log(`JSON: Name=${user.name}, Job=${user.job}, Email=${user.email}`);
      expect(user.name).not.toBeNull();
      expect(user.email).toContain('@');
    }
  });

  test('Inline Script Array Data Test', async () => {
    const userDataArray = [
      { name: 'Alice', job: 'Engineer', email: 'alice@test.com' },
      { name: 'Bob', job: 'Tester', email: 'bob@test.com' }
    ];

    userDataArray.forEach(user => {
      console.log(`Script Array: Name=${user.name}, Job=${user.job}, Email=${user.email}`);
      expect(user.name).not.toBeNull();
      expect(user.email).toContain('@');
    });
  });

  /** 

  test('Database Data Test', async () => {
    const db = new DBUtils();
    await db.connect();
    const user = await db.getUserByEmail('jack.black@test.com');
    await db.disconnect();

    if (user) {
      console.log(`Database: Name=${user.name}, Email=${user.email}`);
      expect(user.email).toContain('@');
    } else {
      console.warn('Database user not found.');
    }
  });
  */

});
