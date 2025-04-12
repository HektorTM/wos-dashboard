const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you're using SQLite database connection

// 1. Get all currencies
router.get('/', (req, res) => {
  try {
    const citems = db.prepare('SELECT * FROM citems').all();
    res.status(200).json(citems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const citem = db.prepare('SELECT * FROM citems WHERE id = ?').get(id);
    if (!citem) {
      return res.status(404).json({ error: 'Citems not found' });
    }
    res.status(200).json(citem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete a currency by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM citems WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Citem not found' });
    }

    res.status(200).json({ message: 'Citem deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
