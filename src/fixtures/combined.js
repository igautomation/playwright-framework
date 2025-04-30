import { expect } from "@playwright/test";
import { customTest } from "./customFixtures.js";
import { createRequestContext, get, post, put, del } from "./api.js";

const test = customTest.extend({
  apiClient: async ({ apiClient }, use) => {
    await use(apiClient);
  },
  retryDiagnostics: async ({ retryDiagnostics }, use) => {
    await use(retryDiagnostics);
  },
});

export { test, expect };
