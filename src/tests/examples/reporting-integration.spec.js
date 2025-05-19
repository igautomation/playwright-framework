// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Example Test: Reporting Integration
 * Demonstrates integration with reporting tools and custom reporting
 */

// Test with custom test info annotations
test('test with custom annotations for reporting', async ({ page }, testInfo) => {
  // Add custom annotations for reporting
  testInfo.annotations.push({ type: 'issue', description: 'https://github.com/org/repo/issues/123' });
  testInfo.annotations.push({ type: 'feature', description: 'Login' });
  
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Add a todo
  await page.getByPlaceholder('What needs to be done?').fill('Report this task');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify the todo was added
  await expect(page.getByTestId('todo-item')).toHaveText('Report this task');
  
  // Add a screenshot for the report
  await testInfo.attach('screenshot', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});

// Test with step reporting
test('test with step reporting', async ({ page }) => {
  // Navigate to the page
  await test.step('Navigate to application', async () => {
    await page.goto('https://demo.playwright.dev/todomvc/#/');
  });
  
  // Add a todo
  await test.step('Add a new todo item', async () => {
    await page.getByPlaceholder('What needs to be done?').fill('Step reported task');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
  });
  
  // Verify the todo was added
  await test.step('Verify todo was added', async () => {
    await expect(page.getByTestId('todo-item')).toHaveText('Step reported task');
  });
  
  // Mark todo as completed
  await test.step('Mark todo as completed', async () => {
    await page.getByRole('checkbox').check();
    await expect(page.locator('.completed')).toHaveCount(1);
  });
});

// Test with custom reporting data
test('test with custom reporting data', async ({ page }, testInfo) => {
  // Start timing
  const startTime = Date.now();
  
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Add a todo
  await page.getByPlaceholder('What needs to be done?').fill('Custom report task');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify the todo was added
  await expect(page.getByTestId('todo-item')).toHaveText('Custom report task');
  
  // Calculate execution time
  const executionTime = Date.now() - startTime;
  
  // Add custom test result data for reporting
  testInfo.attachments.push({
    name: 'execution-time',
    contentType: 'text/plain',
    body: Buffer.from(`${executionTime}ms`)
  });
  
  // Add custom test metadata
  testInfo.attachments.push({
    name: 'test-metadata',
    contentType: 'application/json',
    body: Buffer.from(JSON.stringify({
      feature: 'Todo Management',
      component: 'Todo List',
      priority: 'High',
      executionTime
    }))
  });
});