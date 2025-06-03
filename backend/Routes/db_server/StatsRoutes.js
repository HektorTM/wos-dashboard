const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');

// 1. Get all stats
router.get('/', async (req, res) => {
  try {
    const [stats] = await db.query('SELECT * FROM stats');
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single stats by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM stats WHERE id = ?', [id]);
    const stat = rows[0];

    if (!stat) {
      return res.status(404).json({ error: 'Stat not found' });
    }

    res.status(200).json(stat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new unlockable
router.post('/', async (req, res) => {
  const { id, max, capped, uuid } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    await db.query('INSERT INTO stats (id, max, capped) VALUES (?, ?, ?)', [id, max, capped ? 1 : 0]);

    res.status(201).json({ message: 'Stat created successfully' });

    logActivity({
      type: 'Stat',
      target_id: id,
      user: uuid,
      action: 'Created',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update an existing unlockable
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { max, capped, uuid } = req.body;

  try {
    const [existingRows] = await db.query('SELECT * FROM stats WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Stat not found' });
    }

    const [result] = await db.query('UPDATE stats SET max = ?, capped = ? WHERE id = ?', [max, capped ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes were made to the Stat.' });
    }

    res.status(200).json({ message: 'Stat updated successfully' });

    logActivity({
      type: 'Stat',
      target_id: id,
      user: uuid,
      action: 'Edited',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
});

// 5. Delete unlockable
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    await db.query('DELETE FROM playerdata_stats WHERE id = ?', [id]);
    const [result] = await db.query('DELETE FROM stats WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stat not found' });
    }

    res.status(200).json({ message: 'Stat deleted successfully' });

    try {
      logActivity({
        type: 'Stat',
        target_id: id,
        user: uuid,
        action: 'Deleted',
      });
    } catch (logErr) {
      console.error('Logging failed:', logErr);
    }
  } catch (err) {
    console.error('DELETE stat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
