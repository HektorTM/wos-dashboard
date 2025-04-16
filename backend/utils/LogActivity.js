// utils/logActivity.js
const db = require('../webmeta');

function logActivity({ type, target_id, user, action }) {
  const stmt = db.prepare(`
    INSERT INTO activity_log (type, target_id, user, action)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(type, target_id, user, action);
}

module.exports = logActivity;
