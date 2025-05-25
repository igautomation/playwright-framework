/**
 * API Utilities Index
 * 
 * Exports all API utilities for easy importing
 */

const ApiClient = require('./apiClient');
const AuthUtils = require('./auth');
const GraphQLUtils = require('./graphqlUtils');
const RestUtils = require('./restUtils');
const { SchemaValidator } = require('./schemaValidator');

// Models
const Employee = require('./models/Employee');
const User = require('./models/User');

module.exports = {
  ApiClient,
  AuthUtils,
  GraphQLUtils,
  RestUtils,
  SchemaValidator,
  models: {
    Employee,
    User
  }
};