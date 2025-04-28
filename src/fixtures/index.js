// src/fixtures/index.js (updated)
const { test: base, expect } = require('@playwright/test');
const fs = require('fs');

const test = base.extend({
  defaultTestData: [{ id: '123', name: 'Test User' }, { option: true }],

  // Override Built-in Fixture: Auto-login page
  page: async ({ page, userAccount }, use) => {
    const { username, password } = userAccount;
    await page.goto('/login');
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await use(page);
  },

  loggedInUser: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await use(page);
  },

  testData: async ({ defaultTestData }, use) => {
    await use(defaultTestData);
  },

  userAccount: [
    async ({ browser }, use, workerInfo) => {
      const username = `user${workerInfo.workerIndex}`;
      const password = 'password123';
      const page = await browser.newPage();
      await page.goto('/signup');
      await page.fill('#username', username);
      await page.fill('#password', password);
      await page.click('button[type="submit"]');
      await page.close();
      await use({ username, password });
    },
    { scope: 'worker', timeout: 60000 },
  ],

  debugLogs: [
    async ({}, use, testInfo) => {
      const logs = [];
      console.log = (...args) => logs.push(args.map(String).join(''));
      await use();
      if (testInfo.status !== testInfo.expectedStatus) {
        const logFile = testInfo.outputPath('logs.txt');
        await fs.promises.writeFile(logFile, logs.join('\n'), 'utf8');
        testInfo.attachments.push({ name: 'logs', contentType: 'text/plain', path: logFile });
      }
    },
    { auto: true, box: true, title: 'Debug Logs Capture' },
  ],

  globalBeforeEach: [
    async ({ page }, use) => {
      console.log('Global beforeEach: Navigating to base URL');
      await page.goto(baseURL);
      await use();
    },
    { auto: true },
  ],

  globalAfterEach: [
    async ({ page }, use) => {
      await use();
      console.log('Global afterEach: Last URL:', page.url());
    },
    { auto: true },
  ],

  globalBeforeAll: [
    async ({}, use, workerInfo) => {
      console.log(`Starting test worker ${workerInfo.workerIndex}`);
      await use();
    },
    { scope: 'worker', auto: true },
  ],

  globalAfterAll: [
    async ({}, use, workerInfo) => {
      await use();
      console.log(`Stopping test worker ${workerInfo.workerIndex}`);
    },
    { scope: 'worker', auto: true },
  ],
});

module.exports = { test, expect };