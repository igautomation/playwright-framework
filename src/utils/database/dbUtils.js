/**
 * Database Utilities
 * 
 * Provides utilities for database operations
 */
const config = require('../../config');

/**
 * Database Utilities class
 */
class DBUtils {
  /**
   * Create a new DBUtils instance
   * @param {Object} options - Database connection options
   */
  constructor(options = {}) {
    this.options = {
      type: options.type || process.env.DB_TYPE || 'postgres',
      url: options.url || process.env.DB_URL,
      host: options.host || process.env.DB_HOST,
      port: options.port || process.env.DB_PORT,
      database: options.database || process.env.DB_NAME,
      username: options.username || process.env.DB_USER,
      password: options.password || process.env.DB_PASSWORD,
      ...options
    };
    
    this.client = null;
    this.connected = false;
  }
  
  /**
   * Connect to the database
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connected) {
      return;
    }
    
    try {
      switch (this.options.type.toLowerCase()) {
        case 'postgres':
          await this._connectPostgres();
          break;
        case 'mysql':
          await this._connectMysql();
          break;
        case 'sqlite':
          await this._connectSqlite();
          break;
        case 'mssql':
          await this._connectMssql();
          break;
        default:
          throw new Error(`Unsupported database type: ${this.options.type}`);
      }
      
      this.connected = true;
    } catch (error) {
      console.error(`Failed to connect to ${this.options.type} database:`, error);
      throw error;
    }
  }
  
  /**
   * Disconnect from the database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.connected || !this.client) {
      return;
    }
    
    try {
      switch (this.options.type.toLowerCase()) {
        case 'postgres':
          await this.client.end();
          break;
        case 'mysql':
          await this.client.end();
          break;
        case 'sqlite':
          await this.client.close();
          break;
        case 'mssql':
          await this.client.close();
          break;
      }
      
      this.connected = false;
      this.client = null;
    } catch (error) {
      console.error(`Failed to disconnect from ${this.options.type} database:`, error);
      throw error;
    }
  }
  
  /**
   * Execute a query
   * @param {string} queryText - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(queryText, params = []) {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      let result;
      
      switch (this.options.type.toLowerCase()) {
        case 'postgres':
          result = await this.client.query(queryText, params);
          return result.rows;
        case 'mysql':
          [result] = await this.client.execute(queryText, params);
          return result;
        case 'sqlite':
          if (queryText.trim().toLowerCase().startsWith('select')) {
            result = await this.client.all(queryText, params);
          } else {
            result = await this.client.run(queryText, params);
          }
          return result;
        case 'mssql':
          result = await this.client.request().query(queryText);
          return result.recordset;
        default:
          throw new Error(`Unsupported database type: ${this.options.type}`);
      }
    } catch (error) {
      console.error(`Query failed: ${queryText}`, error);
      throw error;
    }
  }
  
  /**
   * Execute a transaction
   * @param {Function} callback - Transaction callback
   * @returns {Promise<any>} Transaction result
   */
  async transaction(callback) {
    if (!this.connected) {
      await this.connect();
    }
    
    let result;
    
    try {
      switch (this.options.type.toLowerCase()) {
        case 'postgres':
          await this.client.query('BEGIN');
          result = await callback(this);
          await this.client.query('COMMIT');
          break;
        case 'mysql':
          await this.client.beginTransaction();
          result = await callback(this);
          await this.client.commit();
          break;
        case 'sqlite':
          await this.client.run('BEGIN TRANSACTION');
          result = await callback(this);
          await this.client.run('COMMIT');
          break;
        case 'mssql':
          const transaction = this.client.transaction();
          await transaction.begin();
          result = await callback(this);
          await transaction.commit();
          break;
        default:
          throw new Error(`Unsupported database type: ${this.options.type}`);
      }
      
      return result;
    } catch (error) {
      // Rollback transaction on error
      try {
        switch (this.options.type.toLowerCase()) {
          case 'postgres':
            await this.client.query('ROLLBACK');
            break;
          case 'mysql':
            await this.client.rollback();
            break;
          case 'sqlite':
            await this.client.run('ROLLBACK');
            break;
          case 'mssql':
            const transaction = this.client.transaction();
            await transaction.rollback();
            break;
        }
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
      
      console.error('Transaction failed:', error);
      throw error;
    }
  }
  
  /**
   * Get a record by ID
   * @param {string} table - Table name
   * @param {string|number} id - Record ID
   * @param {string} idField - ID field name (default: 'id')
   * @returns {Promise<Object>} Record
   */
  async getById(table, id, idField = 'id') {
    const query = `SELECT * FROM ${table} WHERE ${idField} = ?`;
    const result = await this.query(query, [id]);
    return result[0] || null;
  }
  
  /**
   * Get records by field value
   * @param {string} table - Table name
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise<Array>} Records
   */
  async getByField(table, field, value) {
    const query = `SELECT * FROM ${table} WHERE ${field} = ?`;
    return await this.query(query, [value]);
  }
  
  /**
   * Insert a record
   * @param {string} table - Table name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Inserted record
   */
  async insert(table, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => '?').join(', ');
    
    const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.query(query, values);
    
    return result[0] || null;
  }
  
  /**
   * Update a record
   * @param {string} table - Table name
   * @param {string|number} id - Record ID
   * @param {Object} data - Record data
   * @param {string} idField - ID field name (default: 'id')
   * @returns {Promise<Object>} Updated record
   */
  async update(table, id, data, idField = 'id') {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = ?`).join(', ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${idField} = ? RETURNING *`;
    const result = await this.query(query, [...values, id]);
    
    return result[0] || null;
  }
  
  /**
   * Delete a record
   * @param {string} table - Table name
   * @param {string|number} id - Record ID
   * @param {string} idField - ID field name (default: 'id')
   * @returns {Promise<boolean>} Success
   */
  async delete(table, id, idField = 'id') {
    const query = `DELETE FROM ${table} WHERE ${idField} = ?`;
    const result = await this.query(query, [id]);
    
    return result.affectedRows > 0 || result.rowCount > 0 || result.changes > 0;
  }
  
  /**
   * Connect to PostgreSQL database
   * @private
   */
  async _connectPostgres() {
    const { Client } = require('pg');
    
    const connectionConfig = this.options.url ? 
      { connectionString: this.options.url } : 
      {
        host: this.options.host,
        port: this.options.port,
        database: this.options.database,
        user: this.options.username,
        password: this.options.password
      };
    
    this.client = new Client(connectionConfig);
    await this.client.connect();
  }
  
  /**
   * Connect to MySQL database
   * @private
   */
  async _connectMysql() {
    const mysql = require('mysql2/promise');
    
    const connectionConfig = this.options.url ? 
      { uri: this.options.url } : 
      {
        host: this.options.host,
        port: this.options.port,
        database: this.options.database,
        user: this.options.username,
        password: this.options.password
      };
    
    this.client = await mysql.createConnection(connectionConfig);
  }
  
  /**
   * Connect to SQLite database
   * @private
   */
  async _connectSqlite() {
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    
    this.client = await open({
      filename: this.options.database || ':memory:',
      driver: sqlite3.Database
    });
  }
  
  /**
   * Connect to MSSQL database
   * @private
   */
  async _connectMssql() {
    const sql = require('mssql');
    
    const connectionConfig = this.options.url ? 
      { connectionString: this.options.url } : 
      {
        server: this.options.host,
        port: parseInt(this.options.port),
        database: this.options.database,
        user: this.options.username,
        password: this.options.password,
        options: {
          trustServerCertificate: true
        }
      };
    
    this.client = await sql.connect(connectionConfig);
  }
}

module.exports = DBUtils;