{/*db.js*/}
const Database = require('better-sqlite3');
const path = require('path');

// Go up 4 directories from backend to reach 'I:', then down to the server folder
const dbPath = path.join(__dirname, '../../../..', '1.20.1 Server', 'plugins', 'WoSCore', 'WoS.db');
const db = new Database(dbPath);

module.exports = db;