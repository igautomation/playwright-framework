// src/tests/hybrid/demo-hybrid.spec.js
import { test, expect } from "../../fixtures/combined.js";

test.describe("Hybrid Tests", () => {
  test("@hybrid Demo Hybrid: UI and API in same test", async ({
    authenticatedPage,
    apiClient,
    retryDiagnostics,
  }) => {
    try {
      // UI Part
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      await authenticatedPage.goto(baseURL);
      await expect(authenticatedPage).toHaveTitle(/Automation Exercise/);

      // API Part
      const response = await apiClient.get("/api/productsList");
      expect(response.status()).toBe(200);
    } catch (error) {
      await retryDiagnostics(error);
      throw error;
    }
  });
});
