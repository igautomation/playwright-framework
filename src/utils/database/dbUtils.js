// src/utils/database/dbUtils.js

/**
 * Database Utility for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Connect to PostgreSQL Database
 * - Execute queries
 * - Fetch specific user data for hybrid scenarios
 */

import pkg from 'pg';
const { Client } = pkg;

class DBUtils {
  constructor() {
    if (!process.env.DB_URL) {
      throw new Error('DB_URL environment variable is required');
    }
    this.client = new Client({
      connectionString: process.env.DB_URL
    });
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.end();
  }

  async query(queryText, params = []) {
    const res = await this.client.query(queryText, params);
    return res.rows;
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result[0] || null;
  }
}

export default DBUtils;
