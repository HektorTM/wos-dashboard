const express = require('express');
const router = express.Router();
const db = require('../../webmeta');  // Your MySQL database connection
const requireAuth = require('../../middleware/auth');  // Your authentication middleware

router.use(requireAuth);

// Fetch recent activity
router.get('/recent', async (req, res) => {
  try {
    // Use db.query() to run the SQL query
    const [logs] = await db.query(`
      SELECT a.id, a.type, a.target_id, a.action, a.timestamp, u.username
      FROM activity_log a
      LEFT JOIN users u ON a.user = u.uuid
      ORDER BY a.timestamp DESC
      LIMIT 50
    `);
    res.json(logs);
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ error: 'Failed to fetch activity logs', message: err.message });
  }
});

module.exports = router;
