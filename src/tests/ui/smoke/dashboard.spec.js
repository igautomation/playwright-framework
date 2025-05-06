const { test } = require('../../fixtures/baseFixtures');
const { expect } = require('@playwright/test');

/**
 * Dashboard tests
 */
test.describe('Dashboard Functionality @smoke @ui', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Login before each test
    await loginPage.login(
      process.env.USERNAME || 'Admin',
      process.env.PASSWORD || 'admin123'
    );
    await loginPage.verifyLoginSuccess();
  });

  test('Verify dashboard page elements @p1', async ({
    page,
    dashboardPage,
  }) => {
    // Navigate to dashboard
    await dashboardPage.navigate();

    // Verify dashboard page is displayed
    await dashboardPage.verifyDashboardPageDisplayed();

    // Verify dashboard widgets
    await dashboardPage.verifyTimeAtWorkWidgetDisplayed();
    await dashboardPage.verifyMyActionsWidgetDisplayed();
    await dashboardPage.verifyQuickLaunchSectionDisplayed();

    // Take screenshot for visual verification
    await dashboardPage.takeDashboardScreenshot();
  });

  test('Verify side menu navigation @p2', async ({ page, dashboardPage }) => {
    // Navigate to dashboard
    await dashboardPage.navigate();

    // Get side menu items
    const menuItems = await dashboardPage.getSideMenuItems();

    // Verify at least some expected menu items are present
    expect(menuItems.some((item) => item.includes('Admin'))).toBeTruthy();
    expect(menuItems.some((item) => item.includes('PIM'))).toBeTruthy();
    expect(menuItems.some((item) => item.includes('Leave'))).toBeTruthy();

    // Navigate to a menu item
    await dashboardPage.navigateToMenuItem('Admin');

    // Verify we're on the Admin page
    const headingText = await dashboardPage.getMainHeadingText();
    expect(headingText).toContain('Admin');
  });

  test('Verify quick launch section @p2', async ({ page, dashboardPage }) => {
    // Navigate to dashboard
    await dashboardPage.navigate();

    // Verify quick launch section is displayed
    await dashboardPage.verifyQuickLaunchSectionDisplayed();

    // Get quick launch items
    const quickLaunchItems = await dashboardPage.getQuickLaunchItems();

    // Verify we have at least some quick launch items
    expect(quickLaunchItems.length).toBeGreaterThan(0);
  });

  test('Verify logout functionality @p1', async ({ page, dashboardPage }) => {
    // Navigate to dashboard
    await dashboardPage.navigate();

    // Logout
    await dashboardPage.logout();

    // Verify we're back on the login page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/auth/login');
  });
});
