// src/pages/components/NavigationBar.js

class NavigationBar {
  constructor(page) {
    this.page = page;
    // Selectors for navigation bar elements
    this.navBar = page.locator("nav.header-nav");
    this.homeLink = this.navBar.locator('a[href="/"]');
    this.profileLink = this.navBar.locator('a[href="/profile"]');
    this.logoutLink = this.navBar.locator('a[href="/logout"]');
  }

  // Navigate to the Home page
  async goToHome() {
    await this.homeLink.click();
    await this.page.waitForURL("**/");
  }

  // Navigate to the Profile page
  async goToProfile() {
    await this.profileLink.click();
    await this.page.waitForURL("**/profile");
  }

  // Log out the user
  async logout() {
    await this.logoutLink.click();
    await this.page.waitForURL("**/login");
  }

  // Check if the navigation bar is visible
  async isVisible() {
    return await this.navBar.isVisible();
  }
}

module.exports = NavigationBar;
