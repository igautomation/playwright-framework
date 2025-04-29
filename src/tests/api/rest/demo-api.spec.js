// src/tests/api/rest/demo-api.spec.js
import { test, expect } from "../../../fixtures/combined.js";

test.describe("Demo API Tests", () => {
  test("@api List all products", async ({ apiClient, retryDiagnostics }) => {
    try {
      const baseURL =
        process.env.BASE_URL || "https://automationexercise.com/api";
      const response = await apiClient.get("/productsList");
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body.products)).toBeTruthy();
    } catch (error) {
      await retryDiagnostics(error);
      throw error;
    }
  });
});
