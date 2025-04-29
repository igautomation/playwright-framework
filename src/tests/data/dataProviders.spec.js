// src/tests/data/dataProviders.spec.js
import { test, expect } from "../../fixtures/combined.js";
import { readData } from "../../utils/common/dataUtils.js";
import {
  readYaml,
  readXml,
  readExcel,
} from "../../utils/common/dataOrchestrator.js";
import fs from "fs";

test.describe.parallel("Data Providers - Unified Test Suite", () => {
  test("Excel Data Test", async ({ retryDiagnostics }, testInfo) => {
    const excelPath = "src/data/testData.xlsx";
    if (!fs.existsSync(excelPath)) {
      console.warn(`Excel file not found: ${excelPath}. Skipping test.`);
      testInfo.skip(true, `Excel file not found: ${excelPath}`);
      return;
    }
    try {
      console.log("Attempting to read Excel file:", excelPath);
      const excelData = await readExcel(excelPath);
      console.log("Excel Data:", JSON.stringify(excelData));
      expect(
        excelData.length,
        "Excel data should not be empty"
      ).toBeGreaterThan(0);
      for (const user of excelData) {
        console.log(
          `Excel: Name=${user.name}, Job=${user.job}, Email=${user.email}`
        );
        expect(user.name, "Name should not be null").not.toBeNull();
        expect(user.email, "Email should contain @").toContain("@");
      }
    } catch (error) {
      console.error("Excel Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("CSV Data Test", async ({ retryDiagnostics }) => {
    try {
      const csvData = await readData("src/data/testData.csv");
      console.log("CSV Data:", JSON.stringify(csvData));
      expect(csvData.length, "CSV data should not be empty").toBeGreaterThan(0);
      for (const user of csvData) {
        console.log(
          `CSV: Name=${user.name}, Job=${user.job}, Email=${user.email}`
        );
        expect(user.name, "Name should not be null").not.toBeNull();
        expect(user.email, "Email should contain @").toContain("@");
      }
    } catch (error) {
      console.error("CSV Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("YAML Data Test", async ({ retryDiagnostics }) => {
    try {
      const yamlUser = readYaml("src/data/testData.yaml").user;
      console.log("YAML Data:", JSON.stringify(yamlUser));
      expect(yamlUser, "YAML user should exist").toBeTruthy();
      console.log(
        `YAML: Name=${yamlUser.name}, Job=${yamlUser.job}, Email=${yamlUser.email}`
      );
      expect(yamlUser.name, "Name should not be null").not.toBeNull();
      expect(yamlUser.email, "Email should contain @").toContain("@");
    } catch (error) {
      console.error("YAML Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("XML Data Test", async ({ retryDiagnostics }) => {
    try {
      const xmlUser = readXml("src/data/testData.xml").user;
      console.log("XML Data:", JSON.stringify(xmlUser));
      expect(xmlUser, "XML user should exist").toBeTruthy();
      console.log(
        `XML: Name=${xmlUser.name}, Job=${xmlUser.job}, Email=${xmlUser.email}`
      );
      expect(xmlUser.name, "Name should not be null").not.toBeNull();
      expect(xmlUser.email, "Email should contain @").toContain("@");
    } catch (error) {
      console.error("XML Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("JSON Table Data Test", async ({ retryDiagnostics }) => {
    try {
      const jsonUsers = await readData("src/data/users.json");
      console.log("JSON Data:", JSON.stringify(jsonUsers));
      expect(jsonUsers.length, "JSON data should not be empty").toBeGreaterThan(
        0
      );
      for (const user of jsonUsers) {
        console.log(
          `JSON: Name=${user.name}, Job=${user.job}, Email=${user.email}`
        );
        expect(user.name, "Name should not be null").not.toBeNull();
        expect(user.email, "Email should contain @").toContain("@");
      }
    } catch (error) {
      console.error("JSON Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  test("Inline Script Array Data Test", async ({ retryDiagnostics }) => {
    try {
      const userDataArray = [
        { name: "Alice", job: "Engineer", email: "alice@test.com" },
        { name: "Bob", job: "Tester", email: "bob@test.com" },
      ];
      console.log("Inline Data:", JSON.stringify(userDataArray));
      expect(
        userDataArray.length,
        "Inline data should not be empty"
      ).toBeGreaterThan(0);
      userDataArray.forEach((user) => {
        console.log(
          `Script Array: Name=${user.name}, Job=${user.job}, Email=${user.email}`
        );
        expect(user.name, "Name should not be null").not.toBeNull();
        expect(user.email, "Email should contain @").toContain("@");
      });
    } catch (error) {
      console.error("Inline Test Error:", error.message);
      await retryDiagnostics(error);
      throw error;
    }
  });

  /*
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
