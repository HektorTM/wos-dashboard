// utils/EditData.js
const db = require('../webmeta');

function createData({ type, target_id, createUser, editUser, locked }) {
  const stmt = db.prepare(`
    INSERT INTO page_data (type, id, created_by, last_edited, locked)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(type, target_id, createUser, editUser, locked);
}


module.exports = logActivity;
