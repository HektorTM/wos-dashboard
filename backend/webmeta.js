// webmeta.js
const Database = require('better-sqlite3');
const webMetaDB = new Database('WebMeta.db');

// Create the activity log table if it doesn't exist
webMetaDB.exec(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    user TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

webMetaDB.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uuid TEXT PRIMARY KEY,              -- Minecraft UUID
      username TEXT NOT NULL,             -- Latest known MC username
      password_hash TEXT NOT NULL,        -- Hashed password
      role TEXT DEFAULT 'staff',          -- staff/admin etc.
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
webMetaDB.exec(`
    CREATE TABLE IF NOT EXISTS page_data (
      type TEXT NOT NULL,
      id TEXT NOT NULL,
      created_by TEXT,
      edited_by TEXT,
      locked BOOLEAN,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
  `)

module.exports = webMetaDB;