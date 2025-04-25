/**
 * @fileoverview Tests for Salesforce login functionality
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { HomePage } from '../../pages/HomePage.js';

test.describe('Salesforce Authentication', () => {
  test('should login successfully with valid credentials @smoke @ui', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Act
    await loginPage.loginWithEnvCredentials();
    
    // Assert
    // After successful login, we should see Lightning or Classic home page elements
    const homePage = new HomePage(page);
    const userMenu = homePage.getHealingLocator(homePage.userMenu);
    await expect(userMenu).toBeVisible();
  });
  
  test('should display error with invalid credentials @ui', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Act
    await loginPage.login({
      username: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    // Assert
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).not.toBeNull();
    expect(errorMessage).toContain('check your username and password');
  });
});