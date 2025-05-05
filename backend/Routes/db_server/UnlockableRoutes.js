const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');

// 1. Get all unlockables
router.get('/', async (req, res) => {
  try {
    const [unlockables] = await db.query('SELECT * FROM unlockables');
    res.status(200).json(unlockables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single unlockable by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM unlockables WHERE id = ?', [id]);
    const unlockable = rows[0];

    if (!unlockable) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }

    res.status(200).json(unlockable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new unlockable
router.post('/', async (req, res) => {
  const { id, temp, uuid } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query('INSERT INTO unlockables (id, temp) VALUES (?, ?)', [id, temp ? 1 : 0]);

    res.status(201).json({ message: 'Unlockable created successfully' });

    logActivity({
      type: 'Unlockable',
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
  const { temp, uuid } = req.body;

  try {
    const [existingRows] = await db.query('SELECT * FROM unlockables WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }

    const [result] = await db.query('UPDATE unlockables SET temp = ? WHERE id = ?', [temp ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes were made to the Unlockable.' });
    }

    res.status(200).json({ message: 'Unlockable updated successfully' });

    logActivity({
      type: 'Unlockable',
      target_id: id,
      user: uuid,
      action: 'Edited',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete unlockable
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const {uuid} = req.query;
  try {
    await db.query('DELETE FROM playerdata_unlockables WHERE id = ?', [id]);
    const [result] = await db.query('DELETE FROM unlockables WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }

    res.status(200).json({ message: 'Unlockable deleted successfully' });

    logActivity({
      type: 'Unlockable',
      target_id: id,
      user: uuid,
      action: 'Deleted',
    });
  } catch (err) {
    console.error('DELETE unlockable error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
