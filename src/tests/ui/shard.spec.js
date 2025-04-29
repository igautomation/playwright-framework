// src/tests/ui/shard.spec.js
import { test, expect } from "../../fixtures/combined.js";
import logger from "../../utils/common/logger.js";

test.describe("Shard Tests", () => {
  test("@shard Demo: Shard info and navigation to products page", async ({
    authenticatedPage,
    retryDiagnostics,
  }, testInfo) => {
    try {
      const shardInfo = testInfo.shard;
      if (shardInfo) {
        logger.info(
          `Running on shard ${shardInfo.current} of ${shardInfo.total}`
        );
      } else {
        logger.info("Running without sharding");
      }

      // Use BASE_URL from environment, fallback only for logging
      const baseURL = process.env.BASE_URL || "https://automationexercise.com";
      await authenticatedPage.goto(`${baseURL}/products`);
      await expect(
        authenticatedPage.locator("h2.title.text-center")
      ).toHaveText(/all products/i);
      logger.info("Successfully loaded and verified the Products page.");
    } catch (error) {
      await retryDiagnostics(error);
      throw error;
    }
  });
});
