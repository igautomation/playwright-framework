/**
 * Todo Page Object
 * 
 * Page object for the Todo MVC demo application
 */
const BasePage = require('./BasePage');

class TodoPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // Define selectors
    this.newTodoInput = 'input.new-todo';
    this.todoItems = '.todo-list li';
    this.todoItem = (text) => `.todo-list li:has-text("${text}")`;
    this.todoCheckbox = (text) => `${this.todoItem(text)} .toggle`;
    this.todoDelete = (text) => `${this.todoItem(text)} .destroy`;
    this.clearCompletedButton = '.clear-completed';
    this.todoCount = '.todo-count';
    this.filterAll = 'a[href="#/"]';
    this.filterActive = 'a[href="#/active"]';
    this.filterCompleted = 'a[href="#/completed"]';
  }
  
  /**
   * Navigate to the Todo page
   */
  async goto() {
    await super.goto('/todomvc/#/');
  }
  
  /**
   * Add a new todo item
   * @param {string} text - Todo text
   */
  async addTodo(text) {
    await this.page.fill(this.newTodoInput, text);
    await this.page.press(this.newTodoInput, 'Enter');
  }
  
  /**
   * Get all todo items
   * @returns {Promise<string[]>} Array of todo texts
   */
  async getTodos() {
    return await this.page.locator(this.todoItems).allTextContents();
  }
  
  /**
   * Check if a todo item exists
   * @param {string} text - Todo text
   * @returns {Promise<boolean>} True if todo exists
   */
  async hasTodo(text) {
    return await this.page.locator(this.todoItem(text)).isVisible();
  }
  
  /**
   * Mark a todo item as completed
   * @param {string} text - Todo text
   */
  async completeTodo(text) {
    await this.page.click(this.todoCheckbox(text));
  }
  
  /**
   * Delete a todo item
   * @param {string} text - Todo text
   */
  async deleteTodo(text) {
    // Hover to make the delete button visible
    await this.page.hover(this.todoItem(text));
    await this.page.click(this.todoDelete(text));
  }
  
  /**
   * Clear all completed todos
   */
  async clearCompleted() {
    await this.page.click(this.clearCompletedButton);
  }
  
  /**
   * Get the number of active todos
   * @returns {Promise<number>} Number of active todos
   */
  async getActiveCount() {
    const countText = await this.page.locator(this.todoCount).textContent();
    const match = countText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  /**
   * Filter todos by status
   * @param {'all'|'active'|'completed'} filter - Filter to apply
   */
  async filter(filter) {
    switch (filter) {
      case 'all':
        await this.page.click(this.filterAll);
        break;
      case 'active':
        await this.page.click(this.filterActive);
        break;
      case 'completed':
        await this.page.click(this.filterCompleted);
        break;
    }
  }
}

module.exports = TodoPage;