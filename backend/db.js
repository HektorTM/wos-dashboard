{/*db.js*/}
const Database = require('better-sqlite3');
const db = new Database('WoS.db');

module.exports = db;