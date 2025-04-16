const express = require('express');
const router = express.Router();
const db = require('../webmeta');

router.get('/', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100').all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
