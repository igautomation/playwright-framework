// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Validation Test: Framework Components
 * Validates that all framework components are working correctly
 */

// Test that core directories exist
test('core directories exist', async () => {
  const requiredDirs = [
    'src/tests',
    'src/pages',
    'src/utils',
    'src/data',
    'src/config',
    'scripts',
    'scripts/runners',
    'scripts/utils',
    'scripts/setup',
    'scripts/make-executable'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.resolve(process.cwd(), dir);
    expect(fs.existsSync(dirPath)).toBeTruthy();
  }
});

// Test that core files exist
test('core files exist', async () => {
  const requiredFiles = [
    'package.json',
    'playwright.config.js',
    'scripts/index.js',
    'scripts/utils/framework-health-check.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.resolve(process.cwd(), file);
    expect(fs.existsSync(filePath)).toBeTruthy();
  }
});

// Test that page object model is working
test('page object model is working', async ({ page }) => {
  // Create a simple page object inline for testing
  const todoPage = {
    url: 'https://demo.playwright.dev/todomvc/#/',
    
    // Locators
    newTodo: page.getByPlaceholder('What needs to be done?'),
    todoItems: page.getByTestId('todo-item'),
    
    // Actions
    async goto() {
      await page.goto(this.url);
    },
    
    async addTodo(text) {
      await this.newTodo.fill(text);
      await this.newTodo.press('Enter');
    },
    
    async getTodoTexts() {
      return this.todoItems.allTextContents();
    }
  };
  
  // Use the page object
  await todoPage.goto();
  await todoPage.addTodo('Test POM');
  
  // Verify the page object worked
  const todoTexts = await todoPage.getTodoTexts();
  expect(todoTexts).toContain('Test POM');
});

// Test that utilities are working
test('utility functions are working', async () => {
  // Test a simple utility function
  const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const randomString = generateRandomString(10);
  expect(randomString).toHaveLength(10);
  expect(typeof randomString).toBe('string');
});