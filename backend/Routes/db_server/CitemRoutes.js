const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL connection pool
const logActivity = require('../../utils/LogActivity');

// 1. Get all currencies
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM citems');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM citems WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Citem not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete a currency by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM citems WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Citem not found' });
    }

    res.status(200).json({ message: 'Citem deleted successfully' });
    await logActivity({
      type: 'Citem',
      target_id: id,
      user: uuid,
      action: 'Deleted',
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
