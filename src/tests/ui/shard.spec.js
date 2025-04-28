// src/tests/ui/shard.spec.js
require('module-alias/register');

const { test, expect } = require('@fixtures/combined');
require('module-alias/register');
const logger = require('@utils/common/logger');

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
