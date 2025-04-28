// src/tests/ui/retry-timeout.spec.js
require('module-alias/register');

const { test, expect } = require('@fixtures/combined');

test("Test with retries and timeout", async ({ page }, testInfo) => {
  test.setTimeout(20000);
  await page.goto("https://example.com");
  await expect(page.locator("h1")).toHaveText("Example Domain");
  console.log(`Retry number: ${testInfo.retry}`);
  console.log(`Timeout: ${testInfo.timeout}`);
});

test("Test with slow and custom expect timeout", async ({ page }) => {
  test.slow();
  await page.goto("https://example.com");
  await expect(page.locator("h1")).toHaveText("Example Domain", {
    timeout: 15000,
  });
});
