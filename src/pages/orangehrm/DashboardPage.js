const BasePage = require('../BasePage');
const { expect } = require('@playwright/test');

/**
 * Page object for the OrangeHRM dashboard page
 */
class DashboardPage extends BasePage {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Define page locators
    this.locators = {
      dashboardTitle: '.oxd-topbar-header-breadcrumb > .oxd-text',
      userDropdown: '.oxd-userdropdown-tab',
      logoutLink: 'a:has-text("Logout")',
      quickLaunchItems: '.orangehrm-quick-launch-card',
      timeAtWorkWidget: '.orangehrm-attendance-card',
      employeeDistributionWidget:
        '.oxd-grid-item:has(.orangehrm-dashboard-widget-header:has-text("Employee Distribution by Sub Unit"))',
    };

    // Define page URL
    this.url = '/dashboard/index';
  }

  /**
   * Navigate to the dashboard page
   * @returns {Promise<DashboardPage>} This page object for chaining
   */
  async navigate() {
    await super.navigate(this.url);
    await this.page.waitForSelector(this.locators.dashboardTitle);
    return this;
  }

  /**
   * Verify dashboard page is displayed
   * @returns {Promise<boolean>} Whether dashboard page is displayed
   */
  async verifyDashboardPageDisplayed() {
    try {
      const titleElement = this.page.locator(this.locators.dashboardTitle);
      await expect(titleElement).toBeVisible();

      const title = await titleElement.textContent();
      return title.includes('Dashboard');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get quick launch items count
   * @returns {Promise<number>} Number of quick launch items
   */
  async getQuickLaunchItemsCount() {
    const items = this.page.locator(this.locators.quickLaunchItems);
    return await items.count();
  }

  /**
   * Get quick launch item titles
   * @returns {Promise<string[]>} Array of quick launch item titles
   */
  async getQuickLaunchItemTitles() {
    const items = this.page.locator(this.locators.quickLaunchItems);
    const count = await items.count();

    const titles = [];
    for (let i = 0; i < count; i++) {
      const title = await items
        .nth(i)
        .locator('.orangehrm-quick-launch-card-name')
        .textContent();
      titles.push(title.trim());
    }

    return titles;
  }

  /**
   * Logout from the application
   * @returns {Promise<void>}
   */
  async logout() {
    await this.click(this.locators.userDropdown);
    await this.click(this.locators.logoutLink);

    // Wait for redirect to login page
    await this.page.waitForURL('**/auth/login**');
  }

  /**
   * Get page performance metrics
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceMetrics() {
    // Get performance metrics using JavaScript Performance API
    const metrics = await this.page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      if (perfEntries.length > 0) {
        const navigationEntry = perfEntries[0];
        return {
          loadTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
          domContentLoaded:
            navigationEntry.domContentLoadedEventEnd -
            navigationEntry.startTime,
          firstPaint: navigationEntry.responseStart - navigationEntry.startTime,
          resourceCount: performance.getEntriesByType('resource').length,
          totalResourceSize: performance
            .getEntriesByType('resource')
            .reduce((total, resource) => total + resource.transferSize, 0),
        };
      }
      return null;
    });

    return metrics;
  }
}

module.exports = DashboardPage;
