// @ts-check
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('../../pages/TodoPage');

/**
 * E2E Test Suite for Todo App
 * 
 * Tests the complete workflow of the Todo application
 */
test.describe('Todo App E2E Tests', () => {
  let todoPage;
  
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });
  
  test('should allow adding new todos', async ({ page }) => {
    // Add a new todo
    await todoPage.addTodo('Buy groceries');
    
    // Verify todo was added
    const todos = await todoPage.getTodos();
    expect(todos).toContain('Buy groceries');
  });
  
  test('should allow marking todos as completed', async ({ page }) => {
    // Add a new todo
    await todoPage.addTodo('Pay bills');
    
    // Mark as completed
    await todoPage.completeTodo('Pay bills');
    
    // Verify todo is marked as completed
    await expect(page.locator('.completed')).toHaveCount(1);
  });
  
  test('should allow deleting todos', async ({ page }) => {
    // Add a new todo
    await todoPage.addTodo('Clean house');
    
    // Delete the todo
    await todoPage.deleteTodo('Clean house');
    
    // Verify todo was deleted
    const hasTodo = await todoPage.hasTodo('Clean house');
    expect(hasTodo).toBeFalsy();
  });
  
  test('should display correct count of active todos', async () => {
    // Add multiple todos
    await todoPage.addTodo('Task 1');
    await todoPage.addTodo('Task 2');
    await todoPage.addTodo('Task 3');
    
    // Mark one as completed
    await todoPage.completeTodo('Task 2');
    
    // Verify active count
    const activeCount = await todoPage.getActiveCount();
    expect(activeCount).toBe(2);
  });
  
  test('should allow filtering todos', async ({ page }) => {
    // Add multiple todos
    await todoPage.addTodo('Task 1');
    await todoPage.addTodo('Task 2');
    
    // Mark one as completed
    await todoPage.completeTodo('Task 1');
    
    // Filter by active
    await todoPage.filter('active');
    
    // Verify only active todos are shown
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li')).toHaveText('Task 2');
    
    // Filter by completed
    await todoPage.filter('completed');
    
    // Verify only completed todos are shown
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li')).toHaveText('Task 1');
  });
  
  test('should allow clearing completed todos', async () => {
    // Add multiple todos
    await todoPage.addTodo('Task 1');
    await todoPage.addTodo('Task 2');
    
    // Mark one as completed
    await todoPage.completeTodo('Task 1');
    
    // Clear completed
    await todoPage.clearCompleted();
    
    // Verify completed todo was removed
    const hasTodo = await todoPage.hasTodo('Task 1');
    expect(hasTodo).toBeFalsy();
    
    // Verify active todo remains
    const todos = await todoPage.getTodos();
    expect(todos).toContain('Task 2');
  });
});