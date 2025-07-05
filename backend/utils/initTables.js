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
    CREATE TABLE IF NOT EXISTS requests (
      ind INT AUTO_INCREMENT,
      request_type VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      id VARCHAR(255) NOT NULL,
      description TEXT,
      requester VARCHAR(255) NOT NULL,
      request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      action VARCHAR(255),
      action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      acceptor VARCHAR(255),
      PRIMARY KEY (ind)
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

  await db.query(`
    CREATE TABLE IF NOT EXISTS changelogs (
      id INT NOT NULL AUTO_INCREMENT,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      changelog TEXT NOT NULL,
      created_by VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
    )
    `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(255) NOT NULL,
      uuid VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      public BOOLEAN NOT NULL,
      notes TEXT,
      PRIMARY KEY (id)
    )
    `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS project_items (
      id VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      item_id VARCHAR(255) NOT NULL,
      added_by VARCHAR(255) NOT NULL
    )`)

  await db.query(`
    CREATE TABLE IF NOT EXISTS project_members (
      id VARCHAR(255) NOT NULL,
      uuid VARCHAR(255) NOT NULL
    )
    
    `)

  console.log("Tables initialized.");
})();
