/**
 * GraphQL Utilities for API testing
 * 
 * Note: This module requires the graphql-request package.
 * If not installed, run: npm install graphql-request
 */

/**
 * GraphQL Utilities class for making GraphQL requests
 */
class GraphQLUtils {
  /**
   * Constructor
   * @param {string} endpoint - GraphQL endpoint
   * @param {Object} headers - Request headers
   */
  constructor(endpoint, headers = {}) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    // Check if graphql-request is available
    try {
      const { request, gql } = require('graphql-request');
      this.request = request;
      this.gql = gql;
    } catch (error) {
      console.warn('graphql-request package not found. GraphQL functionality will be limited.');
      this.request = null;
      this.gql = (strings, ...values) => strings.map((str, i) => str + (values[i] || '')).join('');
    }
  }

  /**
   * Set authorization header
   * @param {string} token - Authorization token
   * @param {string} type - Token type (e.g., Bearer)
   * @returns {GraphQLUtils} This instance for chaining
   */
  setAuthToken(token, type = 'Bearer') {
    this.headers['Authorization'] = `${type} ${token}`;
    return this;
  }

  /**
   * Execute a GraphQL query
   * @param {string} query - GraphQL query
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} Query result
   */
  async query(query, variables = {}) {
    if (!this.request) {
      throw new Error('graphql-request package is required. Install it with: npm install graphql-request');
    }
    
    try {
      console.log('Executing GraphQL query', { query, variables });

      const data = await this.request({
        url: this.endpoint,
        document: this.gql`${query}`,
        variables,
        requestHeaders: this.headers,
      });

      console.log('GraphQL query result', { data });
      return data;
    } catch (error) {
      console.error('GraphQL query failed', error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation
   * @param {string} mutation - GraphQL mutation
   * @param {Object} variables - Mutation variables
   * @returns {Promise<Object>} Mutation result
   */
  async mutate(mutation, variables = {}) {
    return this.query(mutation, variables);
  }

  /**
   * Execute a GraphQL request using fetch API (fallback)
   * @param {string} query - GraphQL query or mutation
   * @param {Object} variables - Variables
   * @returns {Promise<Object>} Result
   */
  async fetchGraphQL(query, variables = {}) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('GraphQL request failed', error);
      throw error;
    }
  }
}

module.exports = GraphQLUtils;