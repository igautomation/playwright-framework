// src/tests/ui/shard.spec.js
import { test, expect } from '../../fixtures/combined.js';
import logger from '../../../utils/common/logger.js';

test('@shard Demo: Shard info and navigation to products page', async ({ page }, testInfo) => {
  const shardInfo = testInfo.shard;

  if (shardInfo) {
    logger.info(`Running on shard ${shardInfo.current} of ${shardInfo.total}`);
  } else {
    logger.info('Running without sharding');
  }

  await page.goto('https://automationexercise.com/products');
  await expect(page.locator('h2.title.text-center')).toHaveText(/all products/i);
  logger.info('Successfully loaded and verified the Products page.');
});