// src/tests/ui/regression/demo-regression.spec.js
import { test, expect } from "../../../fixtures/combined.js";

test.describe("Regression Tests", () => {
  test("@regression Demo Regression: Product Search", async ({
    authenticatedPage,
    retryDiagnostics,
  }) => {
    try {
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      await authenticatedPage.goto(`${baseURL}/products`);
      await authenticatedPage.fill("input#search_product", "T-shirt");
      await authenticatedPage.click("button#submit_search");

      await expect(authenticatedPage.locator(".features_items")).toContainText(
        /T-shirt/i
      );
    } catch (error) {
      await retryDiagnostics(error);
      throw error;
    }
  });
});
