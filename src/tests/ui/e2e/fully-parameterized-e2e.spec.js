// src/tests/ui/e2e/fully-parameterized-e2e.spec.js

import { test, expect } from '../../../fixtures/combined.js';
import XPathPracticePage from '../../../pages/XPathPracticePage.js';
import { readYaml, readXml, readExcel } from '../../../utils/common/dataOrchestrator.js';
import fetch from 'node-fetch';

test.describe.parallel('Fully Parameterized E2E - UI + API + Data', () => {
  
  test('UI Login Test using ENV data', async ({ page }) => {
    const practicePage = new XPathPracticePage(page);

    await page.goto(process.env.BASE_UI_URL);

    await practicePage.login(process.env.LOGIN_USERNAME, process.env.LOGIN_PASSWORD);

    await expect(page.locator('#userId')).toHaveValue(process.env.LOGIN_USERNAME);
  });

  test('API Create User using YAML Data', async () => {
    const yamlData = readYaml('src/data/testData.yaml').user;
    
    const response = await fetch(`${process.env.BASE_API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yamlData),
    });
    
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(yamlData.name);
  });

  test('API Create User using XML Data', async () => {
    const xmlData = readXml('src/data/testData.xml').user;

    const response = await fetch(`${process.env.BASE_API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xmlData),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(xmlData.name);
  });

  test('API Create User using Excel Data', async () => {
    const excelData = readExcel('src/data/testData.xlsx')[0];

    const response = await fetch(`${process.env.BASE_API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(excelData),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(excelData.name);
  });

});
