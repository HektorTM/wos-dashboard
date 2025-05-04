// webmeta.js
const mysql = require('mysql2/promise');

// Create the  pool
const webMetaDB = mysql.createPool({
  host: 'localhost',      // Or your server IP
  user: 'root',      // e.g. 'root'
  password: 'HektorTM',  // your MySQL password
  database: 'webmeta',   // your MySQL DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = webMetaDB;