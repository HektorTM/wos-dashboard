// initTables.js (run this once at startup)
const db = require('../webmeta');

(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(255) NOT NULL,
      target_id VARCHAR(255) NOT NULL,
      user VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      uuid VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      permissions TEXT
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS page_data (
      type VARCHAR(255) NOT NULL,
      id VARCHAR(255) NOT NULL,
      created_by VARCHAR(255),
      edited_by VARCHAR(255),
      locked BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (type, id)
    )
  `);

  console.log("Tables initialized.");
})();
