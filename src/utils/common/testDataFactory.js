/**
 * Test Data Factory
 * 
 * Provides functions for generating test data
 */
const { faker } = require('@faker-js/faker');

/**
 * Test Data Factory class
 */
class TestDataFactory {
  /**
   * Generate a random user
   * @param {Object} overrides - Properties to override
   * @returns {Object} User object
   */
  static createUser(overrides = {}) {
    return {
      id: faker.string.uuid(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ...overrides
    };
  }
  
  /**
   * Generate multiple random users
   * @param {number} count - Number of users to generate
   * @param {Object} overrides - Properties to override
   * @returns {Array<Object>} Array of user objects
   */
  static createUsers(count, overrides = {}) {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }
  
  /**
   * Generate a random product
   * @param {Object} overrides - Properties to override
   * @returns {Object} Product object
   */
  static createProduct(overrides = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      ...overrides
    };
  }
  
  /**
   * Generate multiple random products
   * @param {number} count - Number of products to generate
   * @param {Object} overrides - Properties to override
   * @returns {Array<Object>} Array of product objects
   */
  static createProducts(count, overrides = {}) {
    return Array.from({ length: count }, () => this.createProduct(overrides));
  }
  
  /**
   * Generate a random order
   * @param {Object} overrides - Properties to override
   * @returns {Object} Order object
   */
  static createOrder(overrides = {}) {
    const products = this.createProducts(faker.number.int({ min: 1, max: 5 }));
    const total = products.reduce((sum, product) => sum + product.price, 0);
    
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      products,
      total,
      date: faker.date.recent(),
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered']),
      ...overrides
    };
  }
  
  /**
   * Generate random address
   * @param {Object} overrides - Properties to override
   * @returns {Object} Address object
   */
  static createAddress(overrides = {}) {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      ...overrides
    };
  }
  
  /**
   * Generate random credit card
   * @param {Object} overrides - Properties to override
   * @returns {Object} Credit card object
   */
  static createCreditCard(overrides = {}) {
    return {
      number: faker.finance.creditCardNumber(),
      name: faker.person.fullName(),
      expirationDate: faker.date.future().toISOString().split('T')[0],
      cvv: faker.finance.creditCardCVV(),
      ...overrides
    };
  }
}

module.exports = TestDataFactory;