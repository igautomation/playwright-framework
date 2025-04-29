// src/tests/ui/e2e/fully-parameterized-e2e.spec.js
import { test, expect } from "../../../fixtures/combined.js";
import XPathPracticePage from "../../../pages/XPathPracticePage.js";
import {
  readYaml,
  readXml,
  readExcel,
} from "../../../utils/common/dataOrchestrator.js";
import fs from "fs";

test.describe.parallel("Fully Parameterized E2E - UI + API + Data", () => {
  test("UI Login Test using ENV data", async ({
    authenticatedPage,
    retryDiagnostics,
  }) => {
    try {
      const practicePage = new XPathPracticePage(authenticatedPage);
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      await authenticatedPage.goto(baseURL);
      await practicePage.login(
        process.env.LOGIN_USERNAME,
        process.env.LOGIN_PASSWORD
      );
      await expect(authenticatedPage.locator("#userId")).toHaveValue(
        process.env.LOGIN_USERNAME
      );
    } catch (error) {
      console.error("UI Login Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("API Create User using YAML Data", async ({
    apiClient,
    retryDiagnostics,
  }) => {
    try {
      const yamlData = readYaml("src/data/testData.yaml").user;
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      const response = await apiClient.post("/api/users", { data: yamlData });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe(yamlData.name);
    } catch (error) {
      console.error("YAML Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("API Create User using XML Data", async ({
    apiClient,
    retryDiagnostics,
  }) => {
    try {
      const xmlData = readXml("src/data/testData.xml").user;
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      const response = await apiClient.post("/api/users", { data: xmlData });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe(xmlData.name);
    } catch (error) {
      console.error("XML Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("API Create User using Excel Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const excelPath = "src/data/testData.xlsx";
    if (!fs.existsSync(excelPath)) {
      console.warn(`Excel file not found: ${excelPath}. Skipping test.`);
      testInfo.skip(true, `Excel file not found: ${excelPath}`);
      return;
    }
    try {
      console.log("Attempting to read Excel file:", excelPath);
      const excelData = (await readExcel(excelPath))[0];
      console.log("Excel Data:", JSON.stringify(excelData));
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      const response = await apiClient.post("/api/users", { data: excelData });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe(excelData.name);
    } catch (error) {
      console.error("Excel Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });
});
