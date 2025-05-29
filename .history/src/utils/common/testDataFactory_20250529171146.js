/**
 * Test Data Factory
 * Provides methods for generating test data
 */
const { faker } = require('@faker-js/faker');

class TestDataFactory {
  /**
   * Generate a random user
   * @param {Object} options - User options
   * @returns {Object} - User data
   */
  static generateUser(options = {}) {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();
    
    return {
      id: options.id || faker.string.uuid(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: options.email || faker.internet.email({ firstName, lastName }),
      username: options.username || faker.internet.userName({ firstName, lastName }),
      password: options.password || faker.internet.password({ length: 12 }),
      phone: options.phone || faker.phone.number(),
      address: options.address || this.generateAddress(),
      role: options.role || faker.helpers.arrayElement(['admin', 'user', 'manager']),
      department: options.department || faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Marketing']),
      createdAt: options.createdAt || faker.date.past(),
    };
  }

  /**
   * Generate multiple users
   * @param {number} count - Number of users to generate
   * @param {Object} options - User options
   * @returns {Array<Object>} - Array of user data
   */
  static generateUsers(count, options = {}) {
    return Array.from({ length: count }, () => this.generateUser(options));
  }

  /**
   * Generate a random address
   * @param {Object} options - Address options
   * @returns {Object} - Address data
   */
  static generateAddress(options = {}) {
    return {
      street: options.street || faker.location.streetAddress(),
      city: options.city || faker.location.city(),
      state: options.state || faker.location.state(),
      zipCode: options.zipCode || faker.location.zipCode(),
      country: options.country || faker.location.country(),
    };
  }

  /**
   * Generate a random product
   * @param {Object} options - Product options
   * @returns {Object} - Product data
   */
  static generateProduct(options = {}) {
    return {
      id: options.id || faker.string.uuid(),
      name: options.name || faker.commerce.productName(),
      description: options.description || faker.commerce.productDescription(),
      price: options.price || parseFloat(faker.commerce.price()),
      category: options.category || faker.commerce.department(),
      image: options.image || faker.image.url(),
      inStock: options.inStock !== undefined ? options.inStock : faker.datatype.boolean(),
      rating: options.rating || faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    };
  }

  /**
   * Generate multiple products
   * @param {number} count - Number of products to generate
   * @param {Object} options - Product options
   * @returns {Array<Object>} - Array of product data
   */
  static generateProducts(count, options = {}) {
    return Array.from({ length: count }, () => this.generateProduct(options));
  }

  /**
   * Generate a random order
   * @param {Object} options - Order options
   * @returns {Object} - Order data
   */
  static generateOrder(options = {}) {
    const products = options.products || this.generateProducts(faker.number.int({ min: 1, max: 5 }));
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0);
    
    return {
      id: options.id || faker.string.uuid(),
      orderNumber: options.orderNumber || faker.string.alphanumeric(8).toUpperCase(),
      user: options.user || this.generateUser(),
      products,
      totalAmount,
      status: options.status || faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered']),
      paymentMethod: options.paymentMethod || faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer']),
      shippingAddress: options.shippingAddress || this.generateAddress(),
      orderDate: options.orderDate || faker.date.recent(),
    };
  }

  /**
   * Generate test credentials
   * @param {string} type - Credential type
   * @returns {Object} - Credentials
   */
  static generateCredentials(type = 'standard') {
    switch (type) {
      case 'admin':
        return {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
        };
      case 'manager':
        return {
          username: 'manager',
          password: 'manager123',
          role: 'manager',
        };
      case 'invalid':
        return {
          username: 'invalid_user',
          password: 'wrong_password',
          role: 'none',
        };
      case 'standard':
      default:
        return {
          username: 'user',
          password: 'password123',
          role: 'user',
        };
    }
  }
}

module.exports = TestDataFactory;