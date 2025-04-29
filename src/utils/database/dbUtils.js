// src/utils/database/dbUtils.js

const { Client } = require('pg');

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

module.exports = DBUtils;
