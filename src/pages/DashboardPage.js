const BasePage = require('./BasePage');
const logger = require('../utils/common/logger');

/**
 * Dashboard Page class for OrangeHRM
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
      dashboardTitle: '.oxd-topbar-header-title',
      userDropdown: '.oxd-userdropdown-tab',
      userDropdownMenu: '.oxd-dropdown-menu',
      logoutLink: 'a:has-text("Logout")',
      sideMenuItems: '.oxd-main-menu-item',
      quickLaunchItems: '.orangehrm-quick-launch-card',
      dashboardWidgets: '.oxd-grid-item',
      timeAtWorkWidget: '.oxd-sheet:has-text("Time at Work")',
      myActionsWidget: '.oxd-sheet:has-text("My Actions")',
      quickLaunchHeading: '.orangehrm-quick-launch-heading',
      employeeDistributionWidget:
        '.oxd-sheet:has-text("Employee Distribution")',
      loaderSpinner: '.oxd-loading-spinner',
      searchInput: '.oxd-input--search',
      mainHeading: '.oxd-text--h6',
    };
  }

  /**
   * Navigate to dashboard page
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async navigate() {
    logger.info('Navigating to dashboard page');
    await super.navigate('/dashboard/index');
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Verify dashboard page is displayed
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async verifyDashboardPageDisplayed() {
    logger.info('Verifying dashboard page is displayed');
    await this.verifyElementVisible(this.locators.dashboardTitle);
    await this.verifyText(this.locators.dashboardTitle, 'Dashboard');
    return this;
  }

  /**
   * Click user dropdown
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async clickUserDropdown() {
    logger.info('Clicking user dropdown');
    await this.click(this.locators.userDropdown);
    await this.verifyElementVisible(this.locators.userDropdownMenu);
    return this;
  }

  /**
   * Logout
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async logout() {
    logger.info('Logging out');
    await this.clickUserDropdown();
    await this.click(this.locators.logoutLink);
    return this;
  }

  /**
   * Get side menu items
   * @returns {Promise<Array<string>>} Side menu items
   */
  async getSideMenuItems() {
    logger.info('Getting side menu items');
    const menuItems = this.page.locator(this.locators.sideMenuItems);
    const count = await menuItems.count();

    const items = [];
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent();
      items.push(text.trim());
    }

    return items;
  }

  /**
   * Navigate to side menu item
   * @param {string} itemName - Menu item name
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async navigateToMenuItem(itemName) {
    logger.info(`Navigating to menu item: ${itemName}`);
    await this.click(`${this.locators.sideMenuItems}:has-text("${itemName}")`);
    return this;
  }

  /**
   * Get quick launch items
   * @returns {Promise<Array<string>>} Quick launch items
   */
  async getQuickLaunchItems() {
    logger.info('Getting quick launch items');
    const quickLaunchItems = this.page.locator(this.locators.quickLaunchItems);
    const count = await quickLaunchItems.count();

    const items = [];
    for (let i = 0; i < count; i++) {
      const text = await quickLaunchItems.nth(i).textContent();
      items.push(text.trim());
    }

    return items;
  }

  /**
   * Click quick launch item
   * @param {string} itemName - Quick launch item name
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async clickQuickLaunchItem(itemName) {
    logger.info(`Clicking quick launch item: ${itemName}`);
    await this.click(
      `${this.locators.quickLaunchItems}:has-text("${itemName}")`
    );
    return this;
  }

  /**
   * Verify time at work widget is displayed
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async verifyTimeAtWorkWidgetDisplayed() {
    logger.info('Verifying time at work widget is displayed');
    await this.verifyElementVisible(this.locators.timeAtWorkWidget);
    return this;
  }

  /**
   * Verify my actions widget is displayed
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async verifyMyActionsWidgetDisplayed() {
    logger.info('Verifying my actions widget is displayed');
    await this.verifyElementVisible(this.locators.myActionsWidget);
    return this;
  }

  /**
   * Verify quick launch section is displayed
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async verifyQuickLaunchSectionDisplayed() {
    logger.info('Verifying quick launch section is displayed');
    await this.verifyElementVisible(this.locators.quickLaunchHeading);
    return this;
  }

  /**
   * Verify employee distribution widget is displayed
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async verifyEmployeeDistributionWidgetDisplayed() {
    logger.info('Verifying employee distribution widget is displayed');
    await this.verifyElementVisible(this.locators.employeeDistributionWidget);
    return this;
  }

  /**
   * Wait for page to load completely
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async waitForPageLoadComplete() {
    logger.info('Waiting for dashboard page to load completely');

    // Wait for network to be idle
    await this.waitForPageLoad();

    // Wait for loader spinner to disappear
    try {
      await this.page.waitForSelector(this.locators.loaderSpinner, {
        state: 'hidden',
        timeout: 10000,
      });
    } catch (error) {
      logger.warn('Loader spinner not found or already hidden');
    }

    return this;
  }

  /**
   * Search for an item
   * @param {string} searchText - Text to search for
   * @returns {Promise<DashboardPage>} This instance for chaining
   */
  async search(searchText) {
    logger.info(`Searching for: ${searchText}`);
    await this.fill(this.locators.searchInput, searchText);
    await this.pressKey('Enter');
    return this;
  }

  /**
   * Get main heading text
   * @returns {Promise<string>} Main heading text
   */
  async getMainHeadingText() {
    logger.info('Getting main heading text');
    return await this.getText(this.locators.mainHeading);
  }

  /**
   * Take dashboard screenshot
   * @returns {Promise<string>} Path to the screenshot
   */
  async takeDashboardScreenshot() {
    logger.info('Taking dashboard screenshot');
    return await this.takeScreenshot('dashboard-page');
  }
}

module.exports = DashboardPage;
