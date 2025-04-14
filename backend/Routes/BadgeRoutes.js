const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you're using SQLite database connection

// 1. Get all currencies
router.get('/', (req, res) => {
  try {
    const badges = db.prepare('SELECT * FROM badges').all();
    res.status(200).json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const badge = db.prepare('SELECT * FROM badges WHERE id = ?').get(id);
    if (!badge) {
      return res.status(404).json({ error: 'badge not found' });
    }
    res.status(200).json(badge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new currency
router.post('/', (req, res) => {
  const { id, badge, description } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    db.prepare(`
      INSERT INTO badges (id, badge, description)
      VALUES (?, ?, ?)
    `).run(id, badge, description);

    res.status(201).json({ message: 'badge created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update an existing currency by ID
router.put('/:id', (req, res) => {
    const { id } = req.params; // Extract currency id from the URL
    const { badge, description } = req.body;
  
    // Basic validation: check that all required fields are provided
    if (!temp) {
      return res.status(400).json({ error: 'Type is required' });
    }
  
    try {
      // Check if the currency with the provided ID exists
      const existingbadge = db.prepare('SELECT * FROM badges WHERE id = ?').get(id);
      
      if (!existingbadge) {
        return res.status(404).json({ error: 'badge not found' });
      }
  
      // Update the currency if it exists
      const update = db.prepare(`
        UPDATE badges
        SET badge = ?
        SET description = ?
        WHERE id = ?
      `);
  
      const result = update.run(badge, description, id);
  
      // Check if the update affected any rows (i.e., was there a real update)
      if (result.changes === 0) {
        return res.status(400).json({ error: 'No changes were made to the badge.' });
      }
  
      // Send success response
      res.status(200).json({ message: 'badge updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// 5. Delete a currency by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM badges WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'badge not found' });
    }

    res.status(200).json({ message: 'badge deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
