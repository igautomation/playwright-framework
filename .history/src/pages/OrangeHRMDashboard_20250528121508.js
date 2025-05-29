/**
 * OrangeHRMDashboard Page Object
 * Dashboard page after successful login
 */
const { BasePage } = require('./orangehrm/BasePage');

class OrangeHRMDashboard extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Page URL
    this.url = 'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index';

    // Selectors
    this.dashboardTitle = '.oxd-topbar-header-title';
    this.userDropdown = '.oxd-userdropdown-tab';
    this.logoutLink = '.oxd-dropdown-menu li:last-child';
    this.sidebarMenu = '.oxd-sidepanel-body';
    this.adminMenuItem = '.oxd-main-menu-item-wrapper:nth-child(1)';
    this.pimMenuItem = '.oxd-main-menu-item-wrapper:nth-child(2)';
    this.leaveMenuItem = '.oxd-main-menu-item-wrapper:nth-child(3)';
    this.timeMenuItem = '.oxd-main-menu-item-wrapper:nth-child(4)';
    this.dashboardWidgets = '.oxd-grid-item';
  }

  /**
   * Check if user is logged in
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    return await this.isVisible(this.dashboardTitle);
  }

  /**
   * Get dashboard title text
   * @returns {Promise<string>}
   */
  async getDashboardTitle() {
    return await this.getText(this.dashboardTitle);
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.click(this.userDropdown);
    await this.page.waitForSelector(this.logoutLink);
    await this.click(this.logoutLink);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Admin section
   */
  async navigateToAdmin() {
    await this.click(this.adminMenuItem);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to PIM section
   */
  async navigateToPIM() {
    await this.click(this.pimMenuItem);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Leave section
   */
  async navigateToLeave() {
    await this.click(this.leaveMenuItem);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Time section
   */
  async navigateToTime() {
    await this.click(this.timeMenuItem);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get count of dashboard widgets
   * @returns {Promise<number>}
   */
  async getWidgetCount() {
    return await this.page.locator(this.dashboardWidgets).count();
  }
}

module.exports = OrangeHRMDashboard;
