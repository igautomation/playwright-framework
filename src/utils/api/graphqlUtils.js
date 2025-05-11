const { request, gql } = require('graphql-request');
const logger = require('../common/logger');

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
    try {
      logger.debug('Executing GraphQL query', { query, variables });

      const data = await request({
        url: this.endpoint,
        document: gql`
          ${query}
        `,
        variables,
        requestHeaders: this.headers,
      });

      logger.debug('GraphQL query result', { data });
      return data;
    } catch (error) {
      logger.error('GraphQL query failed', error);
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
    try {
      logger.debug('Executing GraphQL mutation', { mutation, variables });

      const data = await request({
        url: this.endpoint,
        document: gql`
          ${mutation}
        `,
        variables,
        requestHeaders: this.headers,
      });

      logger.debug('GraphQL mutation result', { data });
      return data;
    } catch (error) {
      logger.error('GraphQL mutation failed', error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL introspection query
   * @returns {Promise<Object>} Introspection result
   */
  async introspect() {
    try {
      logger.debug('Executing GraphQL introspection query');

      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
        }
        
        fragment FullType on __Type {
          kind
          name
          description
          fields(includeDeprecated: true) {
            name
            description
            args {
              ...InputValue
            }
            type {
              ...TypeRef
            }
            isDeprecated
            deprecationReason
          }
          inputFields {
            ...InputValue
          }
          interfaces {
            ...TypeRef
          }
          enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
          }
          possibleTypes {
            ...TypeRef
          }
        }
        
        fragment InputValue on __InputValue {
          name
          description
          type {
            ...TypeRef
          }
          defaultValue
        }
        
        fragment TypeRef on __Type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const data = await this.query(introspectionQuery);
      logger.debug('GraphQL introspection result', { schema: data.__schema });
      return data;
    } catch (error) {
      logger.error('GraphQL introspection failed', error);
      throw error;
    }
  }

  /**
   * Execute multiple GraphQL operations in a single request
   * @param {Array<Object>} operations - Array of operation objects
   * @returns {Promise<Array<Object>>} Array of operation results
   */
  async batch(operations) {
    try {
      logger.debug('Executing batch GraphQL operations', { operations });

      const promises = operations.map((operation) => {
        const { type, query, variables } = operation;

        if (type === 'query') {
          return this.query(query, variables);
        } else if (type === 'mutation') {
          return this.mutate(query, variables);
        } else {
          throw new Error(`Unsupported operation type: ${type}`);
        }
      });

      const results = await Promise.all(promises);
      logger.debug('Batch GraphQL operations results', { results });
      return results;
    } catch (error) {
      logger.error('Batch GraphQL operations failed', error);
      throw error;
    }
  }

  /**
   * Get a list of types from the schema
   * @returns {Promise<Array<Object>>} Array of types
   */
  async getTypes() {
    try {
      logger.debug('Getting GraphQL schema types');

      const query = `
        query {
          __schema {
            types {
              name
              kind
              description
            }
          }
        }
      `;

      const data = await this.query(query);
      const types = data.__schema.types.filter(
        (type) => !type.name.startsWith('__')
      );

      logger.debug('GraphQL schema types', { types });
      return types;
    } catch (error) {
      logger.error('Failed to get GraphQL schema types', error);
      throw error;
    }
  }

  /**
   * Get details of a specific type
   * @param {string} typeName - Type name
   * @returns {Promise<Object>} Type details
   */
  async getTypeDetails(typeName) {
    try {
      logger.debug(`Getting details for GraphQL type: ${typeName}`);

      const query = `
        query {
          __type(name: "${typeName}") {
            name
            kind
            description
            fields {
              name
              description
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      `;

      const data = await this.query(query);
      logger.debug(`GraphQL type details for ${typeName}`, {
        type: data.__type,
      });
      return data.__type;
    } catch (error) {
      logger.error(
        `Failed to get details for GraphQL type: ${typeName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to a GraphQL subscription
   * @param {string} subscription - GraphQL subscription
   * @param {Function} callback - Callback function for subscription events
   * @param {Object} variables - Subscription variables
   * @returns {Promise<Object>} Subscription object with unsubscribe method
   */
  async subscribe(subscription, callback, variables = {}) {
    try {
      logger.debug('Setting up GraphQL subscription', { subscription, variables });
      
      // This is a placeholder for actual subscription implementation
      // In a real implementation, you would use a WebSocket client or similar
      logger.warn('GraphQL subscriptions are not fully implemented');
      
      return {
        unsubscribe: () => {
          logger.debug('Unsubscribing from GraphQL subscription');
        }
      };
    } catch (error) {
      logger.error('GraphQL subscription failed', error);
      throw error;
    }
  }
}

module.exports = GraphQLUtils;