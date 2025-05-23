/**
 * Product Page
 */
class ProductPage {
  constructor(page) {
    this.page = page;
  }
  
  async navigate() {
    // Navigation logic
  }
  
  async addToCart() {
    // Add to cart logic
  }
  
  async getPrice() {
    return "$99.99";
  }
}

module.exports = ProductPage;