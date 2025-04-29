// src/tests/ui/smoke/demo-smoke.spec.js
import { test, expect } from "../../../fixtures/combined.js";
import HomePage from "../../../pages/HomePage.js";

test.describe("Smoke Tests", () => {
  test("@smoke Home Page Title", async ({
    authenticatedPage,
    retryDiagnostics,
  }) => {
    try {
      const homePage = new HomePage(authenticatedPage);
      await homePage.verifyPageTitle();
    } catch (error) {
      await retryDiagnostics(error);
      throw error;
    }
  });
});
