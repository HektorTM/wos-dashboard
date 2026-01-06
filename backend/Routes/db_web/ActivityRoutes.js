const express = require('express');
const router = express.Router();
const db = require('../../webmeta');  // Your MySQL database connection
const requireAuth = require('../../middleware/auth');  // Your authentication middleware

// Fetch recent activity
router.get('/recent', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 14, 100)
    const offset = (page - 1) * limit

    // 1️⃣ Get total count
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) as total
      FROM activity_log
    `)

    // 2️⃣ Get paginated data
    const [logs] = await db.query(
        `
      SELECT 
        a.id,
        a.type,
        a.target_id,
        a.action,
        a.timestamp,
        u.username
      FROM activity_log a
      LEFT JOIN users u ON a.user = u.uuid
      ORDER BY a.timestamp DESC
      LIMIT ? OFFSET ?
      `,
        [limit, offset]
    )

    res.json({
      data: logs,
      total,
      page,
      limit,
    })
  } catch (err) {
    console.error('Error fetching activity logs:', err)
    res.status(500).json({
      error: 'Failed to fetch activity logs',
      message: err.message,
    })
  }
})


router.get('/me', async (req, res) => {
  const {uuid} = req.body;

  try {

    const logs = await db.query(`
        SELECT * FROM activity_log WHERE user = ?
      `, [uuid]);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs for user', message: err.message});
  }
});

module.exports = router;
