// Routes/PageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../../webmeta');

// 1. Get all changelogs
router.get('/', async (req, res) => {
  try {
    const [entries] = await db.query('SELECT * FROM changelogs ORDER BY time DESC');
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a specific page
router.get('/recent', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM changelogs ORDER BY time DESC LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No changelogs found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { changelog, created_by } = req.body;

  if (!changelog || !created_by) {
    return res.status(400).json({ error: 'changelog and created_by are required' });
  }

  try {
    await db.query('INSERT INTO changelogs (changelog, created_by) VALUES (?, ?)', [changelog, created_by]);
    res.status(201).json({ message: 'Changelog entry added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM changelogs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Changelog not found' });
    }
    res.status(200).json({ message: 'Changelog deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
