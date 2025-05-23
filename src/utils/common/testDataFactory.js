/**
 * Test Data Factory
 * 
 * Provides functions for generating test data
 */

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
      id: this._uuid(),
      username: this._username(),
      password: this._password(),
      email: this._email(),
      firstName: this._firstName(),
      lastName: this._lastName(),
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
      id: this._uuid(),
      name: this._productName(),
      price: this._price(),
      description: this._productDescription(),
      category: this._department(),
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
    const products = this.createProducts(this._randomInt(1, 5));
    const total = products.reduce((sum, product) => sum + product.price, 0);
    
    return {
      id: this._uuid(),
      userId: this._uuid(),
      products,
      total,
      date: this._recentDate(),
      status: this._arrayElement(['pending', 'processing', 'shipped', 'delivered']),
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
      street: this._streetAddress(),
      city: this._city(),
      state: this._state(),
      zipCode: this._zipCode(),
      country: this._country(),
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
      number: this._creditCardNumber(),
      name: `${this._firstName()} ${this._lastName()}`,
      expirationDate: this._futureDate(),
      cvv: this._creditCardCVV(),
      ...overrides
    };
  }
  
  /**
   * Generate API request payload
   * @param {string} type - Type of payload (user, product, etc.)
   * @param {Object} overrides - Properties to override
   * @returns {Object} Request payload
   */
  static createApiPayload(type, overrides = {}) {
    switch (type.toLowerCase()) {
      case 'user':
      case 'createuser':
        return {
          name: `${this._firstName()} ${this._lastName()}`,
          job: this._jobTitle(),
          ...overrides
        };
        
      case 'login':
        return {
          email: overrides.email || this._email(),
          password: overrides.password || this._password(),
          ...overrides
        };
        
      case 'register':
        return {
          email: overrides.email || this._email(),
          password: overrides.password || this._password(),
          ...overrides
        };
        
      case 'product':
      case 'createproduct':
        return {
          name: this._productName(),
          price: this._price(),
          description: this._productDescription(),
          category: this._department(),
          ...overrides
        };
        
      default:
        return { ...overrides };
    }
  }
  
  /**
   * Generate GraphQL query variables
   * @param {string} operationType - Type of operation (user, product, etc.)
   * @param {Object} overrides - Properties to override
   * @returns {Object} GraphQL variables
   */
  static createGraphQLVariables(operationType, overrides = {}) {
    switch (operationType.toLowerCase()) {
      case 'user':
      case 'createuser':
        return {
          input: {
            name: `${this._firstName()} ${this._lastName()}`,
            email: this._email(),
            ...overrides.input
          },
          ...overrides
        };
        
      case 'product':
      case 'createproduct':
        return {
          input: {
            name: this._productName(),
            price: this._price(),
            description: this._productDescription(),
            categoryId: this._uuid(),
            ...overrides.input
          },
          ...overrides
        };
        
      case 'order':
      case 'createorder':
        return {
          input: {
            userId: this._uuid(),
            productIds: [this._uuid(), this._uuid()],
            status: 'PENDING',
            ...overrides.input
          },
          ...overrides
        };
        
      default:
        return { ...overrides };
    }
  }
  
  // Private utility methods for generating random data
  
  /**
   * Generate UUID
   * @returns {string} UUID
   * @private
   */
  static _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Generate random username
   * @returns {string} Username
   * @private
   */
  static _username() {
    const names = ['john', 'jane', 'bob', 'alice', 'charlie', 'diana', 'edward', 'fiona'];
    const name = this._arrayElement(names);
    const number = Math.floor(Math.random() * 1000);
    return `${name}${number}`;
  }
  
  /**
   * Generate random password
   * @returns {string} Password
   * @private
   */
  static _password() {
    return `Pass${Math.floor(Math.random() * 10000)}!`;
  }
  
  /**
   * Generate random email
   * @returns {string} Email
   * @private
   */
  static _email() {
    const names = ['john', 'jane', 'bob', 'alice', 'charlie', 'diana', 'edward', 'fiona'];
    const domains = ['example.com', 'test.com', 'domain.com', 'email.com', 'mail.com'];
    const name = this._arrayElement(names);
    const number = Math.floor(Math.random() * 1000);
    const domain = this._arrayElement(domains);
    return `${name}${number}@${domain}`;
  }
  
  /**
   * Generate random first name
   * @returns {string} First name
   * @private
   */
  static _firstName() {
    const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona', 
                  'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nancy'];
    return this._arrayElement(names);
  }
  
  /**
   * Generate random last name
   * @returns {string} Last name
   * @private
   */
  static _lastName() {
    const names = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
                  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];
    return this._arrayElement(names);
  }
  
  /**
   * Generate random product name
   * @returns {string} Product name
   * @private
   */
  static _productName() {
    const adjectives = ['Awesome', 'Incredible', 'Fantastic', 'Premium', 'Deluxe', 'Ultimate', 'Essential'];
    const products = ['Laptop', 'Phone', 'Tablet', 'Watch', 'Headphones', 'Camera', 'Speaker', 'TV'];
    return `${this._arrayElement(adjectives)} ${this._arrayElement(products)}`;
  }
  
  /**
   * Generate random price
   * @returns {number} Price
   * @private
   */
  static _price() {
    return parseFloat((Math.random() * 1000 + 10).toFixed(2));
  }
  
  /**
   * Generate random product description
   * @returns {string} Product description
   * @private
   */
  static _productDescription() {
    const descriptions = [
      'A high-quality product designed for everyday use.',
      'The perfect solution for all your needs.',
      'Innovative design with premium materials.',
      'Best-in-class performance and reliability.',
      'Cutting-edge technology at an affordable price.'
    ];
    return this._arrayElement(descriptions);
  }
  
  /**
   * Generate random department
   * @returns {string} Department
   * @private
   */
  static _department() {
    const departments = ['Electronics', 'Clothing', 'Home', 'Garden', 'Sports', 'Books', 'Toys', 'Beauty'];
    return this._arrayElement(departments);
  }
  
  /**
   * Generate random street address
   * @returns {string} Street address
   * @private
   */
  static _streetAddress() {
    const number = Math.floor(Math.random() * 1000) + 1;
    const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Park Ln', 'Cedar Blvd', 'Pine Dr', 'Elm St', 'Washington Ave'];
    return `${number} ${this._arrayElement(streets)}`;
  }
  
  /**
   * Generate random city
   * @returns {string} City
   * @private
   */
  static _city() {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 
                   'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'];
    return this._arrayElement(cities);
  }
  
  /**
   * Generate random state
   * @returns {string} State
   * @private
   */
  static _state() {
    const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 
                   'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS'];
    return this._arrayElement(states);
  }
  
  /**
   * Generate random zip code
   * @returns {string} Zip code
   * @private
   */
  static _zipCode() {
    return String(Math.floor(Math.random() * 90000) + 10000);
  }
  
  /**
   * Generate random country
   * @returns {string} Country
   * @private
   */
  static _country() {
    const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'Brazil'];
    return this._arrayElement(countries);
  }
  
  /**
   * Generate random credit card number
   * @returns {string} Credit card number
   * @private
   */
  static _creditCardNumber() {
    const prefixes = ['4', '5', '37', '6'];
    const prefix = this._arrayElement(prefixes);
    let number = prefix;
    
    // Generate random digits
    for (let i = 0; i < 16 - prefix.length; i++) {
      number += Math.floor(Math.random() * 10);
    }
    
    return number;
  }
  
  /**
   * Generate random credit card CVV
   * @returns {string} CVV
   * @private
   */
  static _creditCardCVV() {
    return String(Math.floor(Math.random() * 900) + 100);
  }
  
  /**
   * Generate random future date
   * @returns {string} Future date in YYYY-MM-DD format
   * @private
   */
  static _futureDate() {
    const today = new Date();
    const future = new Date(today);
    future.setFullYear(future.getFullYear() + Math.floor(Math.random() * 5) + 1);
    future.setMonth(Math.floor(Math.random() * 12));
    return future.toISOString().split('T')[0];
  }
  
  /**
   * Generate random recent date
   * @returns {Date} Recent date
   * @private
   */
  static _recentDate() {
    const today = new Date();
    const past = new Date(today);
    past.setDate(past.getDate() - Math.floor(Math.random() * 30));
    return past;
  }
  
  /**
   * Get random element from array
   * @param {Array} array - Array to select from
   * @returns {*} Random element
   * @private
   */
  static _arrayElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Generate random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   * @private
   */
  static _randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate random job title
   * @returns {string} Job title
   * @private
   */
  static _jobTitle() {
    const titles = [
      'Software Engineer', 'Product Manager', 'QA Engineer', 'DevOps Engineer',
      'Data Scientist', 'UX Designer', 'Project Manager', 'Marketing Specialist',
      'Sales Representative', 'Customer Support', 'HR Manager', 'Financial Analyst'
    ];
    return this._arrayElement(titles);
  }
}

module.exports = TestDataFactory;