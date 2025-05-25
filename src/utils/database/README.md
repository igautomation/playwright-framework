# Database Utilities

This directory contains utilities for database operations in the Playwright framework.

## Core Files

- `dbUtils.js` - Database utility for various database operations
- `index.js` - Exports all database utilities

## Features

- Support for multiple database types (PostgreSQL, MySQL, SQLite, MSSQL)
- Connection management
- Query execution
- Transaction support
- CRUD operations (Create, Read, Update, Delete)

## Usage

```javascript
// Import all utilities
const db = require('../src/utils/database');

// Or import specific utilities
const { DBUtils } = require('../src/utils/database');

// Create a database utility instance
const dbUtils = new DBUtils({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  username: 'user',
  password: 'password'
});

// Connect to the database
await dbUtils.connect();

// Execute a query
const users = await dbUtils.query('SELECT * FROM users WHERE active = $1', [true]);

// Get a record by ID
const user = await dbUtils.getById('users', 1);

// Get records by field value
const activeUsers = await dbUtils.getByField('users', 'active', true);

// Insert a record
const newUser = await dbUtils.insert('users', {
  name: 'John Doe',
  email: 'john@example.com',
  active: true
});

// Update a record
const updatedUser = await dbUtils.update('users', 1, {
  name: 'Jane Doe',
  email: 'jane@example.com'
});

// Delete a record
const deleted = await dbUtils.delete('users', 1);

// Execute a transaction
const result = await dbUtils.transaction(async (db) => {
  const user = await db.insert('users', { name: 'John Doe' });
  await db.insert('profiles', { userId: user.id, bio: 'Test user' });
  return user;
});

// Disconnect from the database
await dbUtils.disconnect();
```

## Dependencies

This utility requires the following database drivers depending on the database type you're using:

- PostgreSQL: `pg`
- MySQL: `mysql2`
- SQLite: `sqlite` and `sqlite3`
- MSSQL: `mssql`

Install the required driver for your database:

```bash
# For PostgreSQL
npm install pg

# For MySQL
npm install mysql2

# For SQLite
npm install sqlite sqlite3

# For MSSQL
npm install mssql
```