/**
 * API Request utility for making HTTP requests
 */
class ApiRequest {
  /**
   * Constructor
   * @param {string} baseUrl - Base URL for API requests
   */
  constructor(baseUrl) {
    this.baseUrl = (baseUrl || 'https://restful-booker.herokuapp.com').replace(
      /\/$/,
      ''
    );
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response object
   */
  async get(endpoint, headers = {}) {
    const cleanedEndpoint = endpoint.replace(/^\//, '');
    const url = `${this.baseUrl}/${cleanedEndpoint}`;
    
    try {
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      return {
        status: response.status,
        statusText: response.statusText,
        data: await response.json(),
        headers: response.headers
      };
    } catch (error) {
      console.error(`Error making GET request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response object
   */
  async post(endpoint, data, headers = {}) {
    const cleanedEndpoint = endpoint.replace(/^\//, '');
    const url = `${this.baseUrl}/${cleanedEndpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
      
      return {
        status: response.status,
        statusText: response.statusText,
        data: await response.json(),
        headers: response.headers
      };
    } catch (error) {
      console.error(`Error making POST request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response object
   */
  async put(endpoint, data, headers = {}) {
    const cleanedEndpoint = endpoint.replace(/^\//, '');
    const url = `${this.baseUrl}/${cleanedEndpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
      
      return {
        status: response.status,
        statusText: response.statusText,
        data: await response.json(),
        headers: response.headers
      };
    } catch (error) {
      console.error(`Error making PUT request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response object
   */
  async delete(endpoint, headers = {}) {
    const cleanedEndpoint = endpoint.replace(/^\//, '');
    const url = `${this.baseUrl}/${cleanedEndpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      return {
        status: response.status,
        statusText: response.statusText,
        data: response.status !== 204 ? await response.json() : null,
        headers: response.headers
      };
    } catch (error) {
      console.error(`Error making DELETE request to ${url}:`, error);
      throw error;
    }
  }
}

module.exports = ApiRequest;