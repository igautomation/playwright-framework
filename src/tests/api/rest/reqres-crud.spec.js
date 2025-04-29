// src/tests/api/rest/reqres-crud.spec.js
import { test, expect } from "../../fixtures/combined.js";
import {
  readYaml,
  readXml,
  readExcel,
} from "../../utils/common/dataOrchestrator.js";
import ApiUtils from "../../utils/api/apiUtils.js";
import fs from "fs";
import logger from "../../utils/common/logger.js";

// Schemas for Reqres.in responses
const createUserSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    job: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  required: ["id", "name", "job", "createdAt"],
  additionalProperties: false,
};

const userListSchema = {
  type: "object",
  properties: {
    page: { type: "integer" },
    per_page: { type: "integer" },
    total: { type: "integer" },
    total_pages: { type: "integer" },
    data: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          avatar: { type: "string", format: "uri" },
        },
        required: ["id", "email", "first_name", "last_name", "avatar"],
      },
    },
    support: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        text: { type: "string" },
      },
      required: ["url", "text"],
    },
  },
  required: ["page", "per_page", "total", "total_pages", "data", "support"],
  additionalProperties: false,
};

const singleUserSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        id: { type: "integer" },
        email: { type: "string", format: "email" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        avatar: { type: "string", format: "uri" },
      },
      required: ["id", "email", "first_name", "last_name", "avatar"],
    },
    support: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        text: { type: "string" },
      },
      required: ["url", "text"],
    },
  },
  required: ["data", "support"],
  additionalProperties: false,
};

const updateUserSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    job: { type: "string" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["name", "job", "updatedAt"],
  additionalProperties: false,
};

test.describe.parallel("Reqres.in API CRUD Tests", () => {
  test("Create User with YAML Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      const yamlData = readYaml("src/data/testData.yaml").user;
      const { status, body } = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        yamlData
      );
      expect(status).toBe(201);
      expect(body.name).toBe(yamlData.name);
      expect(body.job).toBe(yamlData.job);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      apiUtils.validateSchema(body, createUserSchema, "POST /api/users");
      testInfo.annotations.push({ type: "user_id", description: body.id });
    } catch (error) {
      const errorMsg = `Create User YAML Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Create User with XML Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      const xmlData = readXml("src/data/testData.xml").user;
      const { status, body } = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        xmlData
      );
      expect(status).toBe(201);
      expect(body.name).toBe(xmlData.name);
      expect(body.job).toBe(xmlData.job);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      apiUtils.validateSchema(body, createUserSchema, "POST /api/users");
      testInfo.annotations.push({ type: "user_id", description: body.id });
    } catch (error) {
      const errorMsg = `Create User XML Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Create User with Excel Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
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
      const { status, body } = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        excelData
      );
      expect(status).toBe(201);
      expect(body.name).toBe(excelData.name);
      expect(body.job).toBe(excelData.job);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      apiUtils.validateSchema(body, createUserSchema, "POST /api/users");
      testInfo.annotations.push({ type: "user_id", description: body.id });
    } catch (error) {
      const errorMsg = `Create User Excel Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Create User with Dynamic Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      const dynamicData = apiUtils.generateDynamicUser();
      logger.info(`Dynamic Data: ${JSON.stringify(dynamicData)}`);
      const { status, body } = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        dynamicData
      );
      expect(status).toBe(201);
      expect(body.name).toBe(dynamicData.name);
      expect(body.job).toBe(dynamicData.job);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      apiUtils.validateSchema(body, createUserSchema, "POST /api/users");
      testInfo.annotations.push({ type: "user_id", description: body.id });
    } catch (error) {
      const errorMsg = `Create User Dynamic Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Read User List with Delay", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      const { status, body } = await apiUtils.sendRequest(
        "GET",
        "/api/users?page=2&delay=1"
      );
      expect(status).toBe(200);
      expect(body.page).toBe(2);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
      apiUtils.validateSchema(body, userListSchema, "GET /api/users?page=2");
    } catch (error) {
      const errorMsg = `Read User List Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Read Single User", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // Create a user first
      const yamlData = readYaml("src/data/testData.yaml").user;
      const createResponse = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        yamlData
      );
      const userId = createResponse.body.id;

      // Read the user
      const { status, body } = await apiUtils.sendRequest(
        "GET",
        `/api/users/${userId}`
      );
      expect(status).toBe(200);
      expect(body.data.id).toBe(userId);
      expect(body.data.email).toBeDefined();
      apiUtils.validateSchema(
        body,
        singleUserSchema,
        `GET /api/users/${userId}`
      );
    } catch (error) {
      const errorMsg = `Read Single User Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Update User", async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // Create a user first
      const yamlData = readYaml("src/data/testData.yaml").user;
      const createResponse = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        yamlData
      );
      const userId = createResponse.body.id;

      // Update with dynamic data
      const updateData = apiUtils.generateDynamicUser();
      const { status, body } = await apiUtils.sendRequest(
        "PUT",
        `/api/users/${userId}`,
        updateData
      );
      expect(status).toBe(200);
      expect(body.name).toBe(updateData.name);
      expect(body.job).toBe(updateData.job);
      expect(body.updatedAt).toBeDefined();
      apiUtils.validateSchema(
        body,
        updateUserSchema,
        `PUT /api/users/${userId}`
      );
    } catch (error) {
      const errorMsg = `Update User Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Delete User", async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // Create a user first
      const yamlData = readYaml("src/data/testData.yaml").user;
      const createResponse = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        yamlData
      );
      const userId = createResponse.body.id;

      // Delete the user
      const { status } = await apiUtils.sendRequest(
        "DELETE",
        `/api/users/${userId}`
      );
      expect(status).toBe(204);

      // Verify idempotency
      const { status: repeatStatus } = await apiUtils.sendRequest(
        "DELETE",
        `/api/users/${userId}`
      );
      expect(repeatStatus).toBe(204);
    } catch (error) {
      const errorMsg = `Delete User Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Create User with Invalid Data", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      const invalidData = { name: "", job: "" };
      const { status } = await apiUtils.sendRequest(
        "POST",
        "/api/users",
        invalidData
      );
      expect(status).toBe(400);
    } catch (error) {
      const errorMsg = `Create User Invalid Data Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });

  test("Read Non-Existent User", async ({
    apiClient,
    retryDiagnostics,
  }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      const { status } = await apiUtils.sendRequest("GET", "/api/users/999");
      expect(status).toBe(404);
    } catch (error) {
      const errorMsg = `Read Non-Existent User Test Error in ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      await retryDiagnostics(error);
      throw new Error(errorMsg);
    }
  });
});
