// src/tests/ui/e2e/fully-parameterized-e2e.spec.js
import { test, expect } from "../../../fixtures/combined.js";
import XPathPracticePage from "../../../pages/XPathPracticePage.js";
import {
  readYaml,
  readXml,
  readExcel,
} from "../../../utils/common/dataOrchestrator.js";
import fs from "fs";
import logger from "../../../utils/common/logger.js";

test.describe.parallel("Fully Parameterized E2E - UI + API + Data", () => {
  test("UI Login Test using ENV data", async ({
    authenticatedPage,
    retryDiagnostics,
  }, testInfo) => {
    try {
      const practicePage = new XPathPracticePage(authenticatedPage);
      // Rely on customFixtures.js to validate BASE_URL
      await authenticatedPage.goto(process.env.BASE_URL);
      await practicePage.login(
        process.env.LOGIN_USERNAME,
        process.env.LOGIN_PASSWORD
      );
      await expect(authenticatedPage.locator("#userId")).toHaveValue(
        process.env.LOGIN_USERNAME
      );
    } catch (error) {
      const errorMsg = `UI Login Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("API Create User using YAML Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    try {
      const yamlData = readYaml("src/data/testData.yaml").user;
      // Rely on customFixtures.js to validate API_BASE_URL
      const response = await apiClient.post("/api/users", { data: yamlData });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe(yamlData.name);
    } catch (error) {
      const errorMsg = `API YAML Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("API Create User using XML Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    try {
      const xmlData = readXml("src/data/testData.xml").user;
      // Rely on customFixtures.js to validate API_BASE_URL
      const response = await apiClient.post("/api/users", { data: xmlData });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe(xmlData.name);
    } catch (error) {
      const errorMsg = `API XML Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("API Create User using Excel Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const excelPath = "src/data/testData.xlsx";
    if (!fs.existsSync(excelPath)) {
      logger.warn(
        `Excel file not found: ${excelPath}. Skipping test: ${testInfo.title}`
      );
      testInfo.skip(true, `Excel file not found: ${excelPath}`);
      return;
    }
    try {
      logger.info(`Attempting to read Excel file: ${excelPath}`);
      const excelData = (await readExcel(excelPath))[0];
      logger.info(`Excel Data: ${JSON.stringify(excelData)}`);
      // Rely on customFixtures.js to validate API_BASE_URL
      const response = await apiClient.post("/api/users", { data: excelData });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe(excelData.name);
    } catch (error) {
      const errorMsg = `API Excel Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });
});
