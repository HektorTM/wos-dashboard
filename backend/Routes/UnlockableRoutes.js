//UnlockableRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you're using SQLite database connection
const logActivity = require('../utils/LogActivity');

// 1. Get all currencies
router.get('/', (req, res) => {
  try {
    const unlockables = db.prepare('SELECT * FROM unlockables').all();
    res.status(200).json(unlockables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const unlockable = db.prepare('SELECT * FROM unlockables WHERE id = ?').get(id);
    if (!unlockable) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }
    res.status(200).json(unlockable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new currency
router.post('/', (req, res) => {
  const { id, temp } = req.body;
  const { uuid } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    db.prepare(`
      INSERT INTO unlockables (id, temp)
      VALUES (?, ?)
    `).run(id, temp ? 1 : 0);

    res.status(201).json({ message: 'Currency created successfully' });
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

// 4. Update an existing currency by ID
router.put('/:id', (req, res) => {
  const { id } = req.params; // Extract currency id from the URL
  const { temp } = req.body;
  const { uuid } = req.query;

  try {
    // Check if the currency with the provided ID exists
    const existingUnlockable = db.prepare('SELECT * FROM unlockables WHERE id = ?').get(id);
    
    if (!existingUnlockable) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }

    // Update the currency if it exists
    const update = db.prepare(`
      UPDATE unlockables
      SET temp = ?
      WHERE id = ?
    `);

    const result = update.run(temp ? 1 : 0, id);

    // Check if the update affected any rows (i.e., was there a real update)
    if (result.changes === 0) {
      return res.status(400).json({ error: 'No changes were made to the Unlockable.' });
    }

    // Send success response
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
  

// 5. Delete a Unlockable by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    db.prepare('DELETE FROM player_unlockables WHERE unlockable_id = ?').run(id);
    const result = db.prepare('DELETE FROM unlockables WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Unlockable not found' });
    }

    res.status(200).json({ message: 'Unlockable deleted successfully' });
    try {
      logActivity({
        type: 'Unlockable',
        target_id: id,
        user: uuid,
        action: 'Deleted',
      });
    } catch (logErr) {
      console.error('Logging failed:', logErr);
    }
    

  } catch (err) {
    console.error('DELETE unlockable error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
