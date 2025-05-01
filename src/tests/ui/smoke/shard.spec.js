// src/tests/ui/shard.spec.js

import { test, expect } from '@fixtures/combined.js';
import logger from '@utils/common/logger.js';

test.describe('@ui Shard-based Execution Test', () => {
  test('@shard Should log shard details and verify Products page', async ({
    authenticatedPage,
    retryDiagnostics
  }, testInfo) => {
    try {
      // Log the current shard index and total, if sharding is enabled
      const shardInfo = testInfo.shard;
      if (shardInfo) {
        logger.info(`Executing on shard ${shardInfo.current} of ${shardInfo.total}`);
      } else {
        logger.info('Test is running without sharding configuration');
      }

      // Navigate to the target products page
      const baseURL = process.env.BASE_URL || 'https://automationexercise.com';
      await authenticatedPage.goto(`${baseURL}/products`);

      // Assert expected content is present on the page
      await expect(authenticatedPage.locator('h2.title.text-center')).toHaveText(/all products/i);
      logger.info('Verified product listing page loaded successfully.');
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Shard-based UI test failed: ' + error.message);
    }
  });
});
