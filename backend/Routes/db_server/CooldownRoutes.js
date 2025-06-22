const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');

// 1. Get all cooldowns
router.get('/', async (req, res) => {
  try {
    const [stats] = await db.query('SELECT * FROM cooldowns');
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single cooldown by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM cooldowns WHERE id = ?', [id]);
    const cooldown = rows[0];

    if (!cooldown) {
      return res.status(404).json({ error: 'Cooldown not found' });
    }

    res.status(200).json(cooldown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new cooldown
router.post('/', async (req, res) => {
  const { id, duration, start_interaction, end_interaction, uuid } = req.body;

  if (!id || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    await db.query('INSERT INTO cooldowns (id, duration, start_interaction, end_interaction) VALUES (?, ?, ?, ?)', [
      id,
      duration,
      start_interaction ? start_interaction : null,
      end_interaction ? end_interaction : null
    ]);

    res.status(201).json({ message: 'Cooldown created successfully' });

    logActivity({
      type: 'Cooldown',
      target_id: id,
      user: uuid,
      action: 'Created',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update an existing cooldown
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { duration, start_interaction, end_interaction, uuid } = req.body;

  try {
    const [existingRows] = await db.query('SELECT * FROM cooldowns WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Cooldown not found' });
    }

    const [result] = await db.query('UPDATE cooldowns SET duration = ?, start_interaction = ?, end_interaction = ? WHERE id = ?', [
      duration,
      start_interaction ? start_interaction : null,
      end_interaction ? end_interaction : null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes were made to the Cooldown.' });
    }

    res.status(200).json({ message: 'Cooldown updated successfully' });

    logActivity({
      type: 'Cooldown',
      target_id: id,
      user: uuid,
      action: 'Edited',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
});

// 5. Delete cooldown
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    await db.query('DELETE FROM playerdata_cooldowns WHERE id = ?', [id]);
    const [result] = await db.query('DELETE FROM cooldowns WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cooldown not found' });
    }

    res.status(200).json({ message: 'Cooldown deleted successfully' });

    try {
      logActivity({
        type: 'Cooldown',
        target_id: id,
        user: uuid,
        action: 'Deleted',
      });
    } catch (logErr) {
      console.error('Logging failed:', logErr);
    }
  } catch (err) {
    console.error('DELETE cooldown error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
