const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity'); 

// 1. Get all fishes
router.get('/', async (req, res) => {
  try {
    const [fishes] = await db.query('SELECT * FROM fishing');
    res.status(200).json(fishes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single fish by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM fishing WHERE id = ?', [id]);
    const fish = rows[0];

    if (!fish) {
      return res.status(404).json({ error: 'Fish not found' });
    }

    res.status(200).json(fish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new unlockable
router.post('/', async (req, res) => {
  const { id, citem_id, catch_interaction, rarity, regions, uuid } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [existingRows] = await db.query('SELECT * FROM fishing WHERE id = ?', [id]);
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Fish with this ID already exists' });
    }

    await db.query('INSERT INTO fishing (id, citem_id, catch_interaction, rarity, regions) VALUES (?, ?, ?, ?, ?)', [id, citem_id, catch_interaction, rarity, regions]);

    res.status(201).json({ message: 'Fish created successfully' });

    logActivity({
      type: 'Fish',
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
  const { citem_id, catch_interaction, rarity, regions, uuid } = req.body;

  try {
    const [existingRows] = await db.query('SELECT * FROM fishing WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }

    const [result] = await db.query('UPDATE fishing SET citem_id = ?, catch_interaction = ?, rarity = ?, regions = ? WHERE id = ?', [citem_id, catch_interaction, rarity, regions, id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes were made to the Fish.' });
    }

    res.status(200).json({ message: 'Fish updated successfully' });

    logActivity({
      type: 'Fish',
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
    await db.query('DELETE FROM fishing WHERE id = ?', [id]);
    const [result] = await db.query('DELETE FROM unlockables WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fish not found' });
    }

    res.status(200).json({ message: 'Fish deleted successfully' });

    logActivity({
      type: 'Fish',
      target_id: id,
      user: uuid,
      action: 'Deleted',
    });
  } catch (err) {
    console.error('DELETE fish error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
