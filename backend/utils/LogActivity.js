// utils/logActivity.js
const db = require('../webmeta');  // Importing your MySQL database connection

async function logActivity({ type, target_id, user, action }) {
  try {
    // Use db.query() to run the SQL query with parameterized values
    const query = `
      INSERT INTO activity_log (type, target_id, user, action)
      VALUES (?, ?, ?, ?)
    `;
    
    // Execute the query, passing values as an array
    await db.query(query, [type, target_id, user, action]);
    
  } catch (err) {
    console.error('Error logging activity:', err);
    throw new Error('Failed to log activity');
  }
}

module.exports = logActivity;
