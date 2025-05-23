/**
 * Dashboard Page
 */
class DashboardPage {
  constructor(page) {
    this.page = page;
  }
  
  async verifyDashboardPageDisplayed() {
    await this.page.waitForSelector('.oxd-topbar-header');
  }
  
  async verifyUserMenuDisplayed() {
    await this.page.waitForSelector('.oxd-userdropdown');
  }
  
  async clickUserMenu() {
    await this.page.click('.oxd-userdropdown-tab');
  }
  
  async verifyLogoutOptionDisplayed() {
    await this.page.waitForSelector('a:has-text("Logout")');
  }
  
  async logout() {
    await this.clickUserMenu();
    await this.page.click('a:has-text("Logout")');
  }
  
  async verifyTimeAtWorkWidgetDisplayed() {
    await this.page.waitForSelector('.orangehrm-dashboard-widget');
  }
}

exports.DashboardPage = DashboardPage;