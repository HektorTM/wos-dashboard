// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Create the  pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT, 10) || 10,
  queueLimit: 0
});

module.exports = db;
