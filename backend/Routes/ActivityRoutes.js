// Routes/ActivityRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../webmeta');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Fetch recent activity
router.get('/recent', (req, res) => {
  const logs = db.prepare(`
    SELECT a.id, a.type, a.target_id, a.action, a.timestamp, u.username
    FROM activity_log a
    LEFT JOIN users u ON a.user = u.uuid
    ORDER BY a.timestamp DESC
    LIMIT 50
  `).all();

  res.json(logs);
});

module.exports = router;
