// src/templates/SamplePage.js
class SamplePage {
  constructor(page) {
    this.page = page;
  }
  async navigate() {
    await this.page.goto("https://example.com");
  }
  async getTitle() {
    return await this.page.title();
  }
}
module.exports = SamplePage;
