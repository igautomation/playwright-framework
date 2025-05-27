/**
 * Todo App E2E Tests
 * 
 * End-to-end tests for a todo application
 */
const { test, expect } = require('@playwright/test');
const config = require('../../config');

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the todo app
    await page.goto(config.urls.todoMVC);
  });
  
  test('should allow adding todo items', async ({ page }) => {
    // Add a new todo item
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.keyboard.press('Enter');
    
    // Verify the todo was added
    const todoItems = page.getByTestId('todo-item');
    await expect(todoItems).toHaveCount(1);
    await expect(todoItems.first()).toHaveText('Buy groceries');
    
    // Add another todo item
    await page.getByPlaceholder('What needs to be done?').fill('Clean the house');
    await page.keyboard.press('Enter');
    
    // Verify both todos are present
    await expect(todoItems).toHaveCount(2);
    await expect(todoItems).toContainText(['Buy groceries', 'Clean the house']);
  });
  
  test('should allow completing todo items', async ({ page }) => {
    // Add a todo item
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.keyboard.press('Enter');
    
    // Complete the todo
    await page.getByRole('checkbox').first().check();
    
    // Verify the todo is marked as completed
    await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    
    // Filter to show only completed items
    await page.getByRole('link', { name: 'Completed' }).click();
    
    // Verify the completed todo is visible
    await expect(page.getByTestId('todo-item')).toBeVisible();
    
    // Filter to show only active items
    await page.getByRole('link', { name: 'Active' }).click();
    
    // Verify the completed todo is not visible
    await expect(page.getByTestId('todo-item')).not.toBeVisible();
  });
  
  test('should allow editing todo items', async ({ page }) => {
    // Add a todo item
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.keyboard.press('Enter');
    
    // Double-click to edit
    await page.getByTestId('todo-item').dblclick();
    
    // Edit the todo
    const editInput = page.getByRole('textbox', { class: 'edit' });
    await editInput.fill('Buy organic groceries');
    await editInput.press('Enter');
    
    // Verify the todo was updated
    await expect(page.getByTestId('todo-item')).toHaveText('Buy organic groceries');
  });
  
  test('should allow deleting todo items', async ({ page }) => {
    // Add a todo item
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.keyboard.press('Enter');
    
    // Hover over the todo to reveal the delete button
    await page.getByTestId('todo-item').hover();
    
    // Click the delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify the todo was deleted
    await expect(page.getByTestId('todo-item')).not.toBeVisible();
  });
  
  test('should display correct count of remaining items', async ({ page }) => {
    // Add multiple todo items
    await page.getByPlaceholder('What needs to be done?').fill('Item 1');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('What needs to be done?').fill('Item 2');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('What needs to be done?').fill('Item 3');
    await page.keyboard.press('Enter');
    
    // Verify the count shows 3 items
    await expect(page.locator('.todo-count')).toContainText('3 items left');
    
    // Complete one item
    await page.getByRole('checkbox').first().check();
    
    // Verify the count shows 2 items
    await expect(page.locator('.todo-count')).toContainText('2 items left');
    
    // Complete another item
    await page.getByRole('checkbox').nth(1).check();
    
    // Verify the count shows 1 item
    await expect(page.locator('.todo-count')).toContainText('1 item left');
  });
});