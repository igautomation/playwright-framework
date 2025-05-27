/**
 * Navigation Tests
 * 
 * Core tests for navigation functionality
 */
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://opensource-demo.orangehrmlive.com');
    
    // Login with default credentials
    await page.getByPlaceholder('Username').fill(process.env.USERNAME);
    await page.getByPlaceholder('Password').fill(process.env.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
  });
  
  test('should navigate to Admin page', async ({ page }) => {
    // Click on Admin in the sidebar
    await page.getByRole('link', { name: process.env.USERNAME }).click();
    
    // Verify navigation to Admin page
    await page.waitForURL('**/admin/viewSystemUsers');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText(process.env.USERNAME);
  });
  
  test('should navigate to PIM page', async ({ page }) => {
    // Click on PIM in the sidebar
    await page.getByRole('link', { name: 'PIM' }).click();
    
    // Verify navigation to PIM page
    await page.waitForURL('**/pim/viewEmployeeList');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('PIM');
  });
  
  test('should navigate to Leave page', async ({ page }) => {
    // Click on Leave in the sidebar
    await page.getByRole('link', { name: 'Leave' }).click();
    
    // Verify navigation to Leave page
    await page.waitForURL('**/leave/viewLeaveList');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Leave');
  });
  
  test('should navigate to Time page', async ({ page }) => {
    // Click on Time in the sidebar
    await page.getByRole('link', { name: 'Time' }).click();
    
    // Verify navigation to Time page
    await page.waitForURL('**/time/viewEmployeeTimesheet');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Time');
  });
  
  test('should navigate to Recruitment page', async ({ page }) => {
    // Click on Recruitment in the sidebar
    await page.getByRole('link', { name: 'Recruitment' }).click();
    
    // Verify navigation to Recruitment page
    await page.waitForURL('**/recruitment/viewCandidates');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Recruitment');
  });
  
  test('should navigate back to Dashboard', async ({ page }) => {
    // First navigate to another page
    await page.getByRole('link', { name: process.env.USERNAME }).click();
    await page.waitForURL('**/admin/viewSystemUsers');
    
    // Then navigate back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    
    // Verify navigation to Dashboard
    await page.waitForURL('**/dashboard/index');
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Dashboard');
  });
});