const express = require('express');
const router = express.Router();
const db = require('../../webmeta'); // mysql2 pool

router.get('/', async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
