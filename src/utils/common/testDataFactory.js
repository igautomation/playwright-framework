/**
 * Test data factory for generating test data
 */
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class TestDataFactory {
  /**
   * Generate random user data
   * @param {Object} options - User data options
   * @returns {Object} User data
   */
  static generateUser(options = {}) {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();
    const email = options.email || faker.internet.email({ firstName, lastName });
    
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      username: options.username || faker.internet.userName({ firstName, lastName }),
      firstName,
      lastName,
      email,
      password: options.password || faker.internet.password(),
      phone: options.phone || faker.phone.number(),
      userStatus: options.userStatus || faker.number.int({ min: 0, max: 1 })
    };
  }

  /**
   * Generate multiple users
   * @param {number} count - Number of users to generate
   * @param {Object} options - User data options
   * @returns {Array<Object>} Array of user data
   */
  static generateUsers(count, options = {}) {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      users.push(this.generateUser(options));
    }
    
    return users;
  }

  /**
   * Generate random product data
   * @param {Object} options - Product data options
   * @returns {Object} Product data
   */
  static generateProduct(options = {}) {
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      name: options.name || faker.commerce.productName(),
      description: options.description || faker.commerce.productDescription(),
      price: options.price || parseFloat(faker.commerce.price()),
      category: options.category || faker.commerce.department(),
      image: options.image || faker.image.url(),
      rating: options.rating || {
        rate: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        count: faker.number.int({ min: 1, max: 1000 })
      }
    };
  }

  /**
   * Generate multiple products
   * @param {number} count - Number of products to generate
   * @param {Object} options - Product data options
   * @returns {Array<Object>} Array of product data
   */
  static generateProducts(count, options = {}) {
    const products = [];
    
    for (let i = 0; i < count; i++) {
      products.push(this.generateProduct(options));
    }
    
    return products;
  }

  /**
   * Generate random order data
   * @param {Object} options - Order data options
   * @returns {Object} Order data
   */
  static generateOrder(options = {}) {
    const products = options.products || [
      this.generateProduct(),
      this.generateProduct()
    ];
    
    const total = products.reduce((sum, product) => sum + product.price, 0);
    
    return {
      id: options.id || faker.number.int({ min: 1, max: 10000 }),
      userId: options.userId || faker.number.int({ min: 1, max: 1000 }),
      date: options.date || faker.date.recent(),
      products,
      total: options.total || total,
      status: options.status || faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered'])
    };
  }

  /**
   * Save test data to file
   * @param {Object|Array} data - Data to save
   * @param {string} filename - Filename
   * @returns {string} File path
   */
  static saveToFile(data, filename) {
    const dataDir = path.join(process.cwd(), 'test-data');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    logger.info(`Test data saved to ${filePath}`);
    return filePath;
  }

  /**
   * Load test data from file
   * @param {string} filename - Filename
   * @returns {Object|Array} Loaded data
   */
  static loadFromFile(filename) {
    const filePath = path.join(process.cwd(), 'test-data', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    logger.info(`Test data loaded from ${filePath}`);
    
    return data;
  }
}

module.exports = TestDataFactory;