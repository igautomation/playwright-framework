// src/tests/ui/shard.spec.js
const { test, expect } = require('@fixtures/combined');
const logger = require("../../../utils/logger");

test("Test with shard logic", async ({ page }, testInfo) => {
  const shardInfo = testInfo.shard;
  if (shardInfo) {
    logger.info(`Running on shard ${shardInfo.current} of ${shardInfo.total}`);
  }
  await page.goto("https://example.com");
  logger.info("Navigated to example.com");
  await expect(page.locator("h1")).toHaveText("Example Domain");
  logger.info('Assertion passed: h1 text is "Example Domain"');
});
