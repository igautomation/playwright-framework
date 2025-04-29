// src/templates/sample-test.spec.js
import { test, expect } from "@playwright/test";
// This is a sample test file. You can modify it to create your own tests.
test("sample test", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page.locator("h1")).toHaveText("Example Domain");
});
