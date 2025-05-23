/**
 * Data Generator
 * 
 * Provides utilities for generating test data
 */

/**
 * Data Generator class
 */
class DataGenerator {
  /**
   * Constructor
   */
  constructor() {
    this.firstNames = [
      'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa',
      'William', 'Jessica', 'James', 'Jennifer', 'Daniel', 'Amanda', 'Joseph', 'Ashley'
    ];
    
    this.lastNames = [
      'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
      'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'
    ];
    
    this.jobTitles = [
      'Software Engineer', 'QA Engineer', 'Product Manager', 'Designer', 'Developer',
      'Tester', 'Project Manager', 'Business Analyst', 'DevOps Engineer', 'Data Scientist'
    ];
  }
  
  /**
   * Generate a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate a random element from an array
   * @param {Array} array - Array to pick from
   * @returns {*} Random element
   */
  randomElement(array) {
    return array[this.randomInt(0, array.length - 1)];
  }
  
  /**
   * Generate a random string
   * @param {number} length - Length of the string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  randomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
  
  /**
   * Generate a random first name
   * @returns {string} First name
   */
  firstName() {
    return this.randomElement(this.firstNames);
  }
  
  /**
   * Generate a random last name
   * @returns {string} Last name
   */
  lastName() {
    return this.randomElement(this.lastNames);
  }
  
  /**
   * Generate a random full name
   * @returns {string} Full name
   */
  fullName() {
    return `${this.firstName()} ${this.lastName()}`;
  }
  
  /**
   * Generate a random email
   * @param {string} domain - Email domain
   * @returns {string} Email address
   */
  email(domain = 'example.com') {
    const username = this.firstName().toLowerCase() + '.' + this.lastName().toLowerCase();
    return `${username}@${domain}`;
  }
  
  /**
   * Generate a random username
   * @returns {string} Username
   */
  username() {
    return this.firstName().toLowerCase() + this.randomInt(100, 999);
  }
  
  /**
   * Generate a random password
   * @param {number} length - Password length
   * @returns {string} Password
   */
  password(length = 10) {
    return this.randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*');
  }
  
  /**
   * Generate a random job title
   * @returns {string} Job title
   */
  jobTitle() {
    return this.randomElement(this.jobTitles);
  }
  
  /**
   * Generate a random employee ID
   * @returns {string} Employee ID
   */
  employeeId() {
    return `EMP${this.randomInt(10000, 99999)}`;
  }
  
  /**
   * Generate a random date
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Date} Random date
   */
  date(start = new Date(2000, 0, 1), end = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  
  /**
   * Generate a random date string in ISO format
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {string} ISO date string
   */
  dateString(start = new Date(2000, 0, 1), end = new Date()) {
    return this.date(start, end).toISOString();
  }
}

module.exports = {
  DataGenerator
};