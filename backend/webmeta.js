// webmeta.js
const mysql = require('mysql2/promise');

// Create the  pool
const webMetaDB = mysql.createPool({
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER,
  password: process.env.DB2_PASSWORD,
  database: process.env.DB2_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB2_CONN_LIMIT, 10) || 10,
  queueLimit: 0
});

module.exports = webMetaDB;