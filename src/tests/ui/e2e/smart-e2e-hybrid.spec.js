import { test, expect } from '../../../fixtures/combined.js';
import XPathPracticePage from '../../../pages/XPathPracticePage.js';
import { readYaml, readXml, readExcel } from '../../../utils/common/dataOrchestrator.js';
import fetch from 'node-fetch';
import fs from 'fs';

test.describe.parallel('@e2e @hybrid @ui @api Smart Hybrid Flow', () => {
  test('UI Login using Environment Credentials', async ({ page }) => {
    const xpathPage = new XPathPracticePage(page);
});

    await xpathPage.goto();
    await xpathPage.verifyTitleVisible();
    await xpathPage.enterUsername(process.env.LOGIN_USERNAME);
    await xpathPage.enterPassword(process.env.LOGIN_PASSWORD);
    await xpathPage.clickLogin();
    await expect(page.locator('#userName-value')).toBeVisible();
  });

  test('API Create User using YAML data', async () => {
    const yamlData = readYaml('src/data/testData.yaml');
    const response = await fetch(`${process.env.API_URL}/'https:/`users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yamlData)
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(yamlData.name);
  });

  test('API Create User using XML data', async () => {
    const xmlData = readXml('src/data/testData.xml');
    const response = await fetch(`${process.env.API_URL}/'https:/`users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xmlData.user)
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(xmlData.user.name);
  });

  test('API Create User using Excel data', async () => {
    const excelData = readExcel('src/data/testData.xlsx')[0];
    const response = await fetch(`${process.env.API_URL}/'https:/`users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(excelData)
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(excelData.name);
  });
});
