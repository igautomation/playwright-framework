// src/templates/sample-test.spec.js
const { test, expect } = require("@playwright/test");

test("sample test", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page.locator("h1")).toHaveText("Example Domain");
});
