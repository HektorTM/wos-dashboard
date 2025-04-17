const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you're using SQLite database connection
const logActivity = require('../utils/LogActivity');



// 1. Get all currencies
router.get('/', (req, res) => {
  try {
    const currencies = db.prepare('SELECT * FROM currencies').all();
    res.status(200).json(currencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const currency = db.prepare('SELECT * FROM currencies WHERE id = ?').get(id);
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    res.status(200).json(currency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new currency
router.post('/', (req, res) => {
  const { id, name, short_name, icon, color, hidden_if_zero } = req.body;
  const {uuid} = req.body;
  if (!id || !name || !short_name || !color) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    db.prepare(`
      INSERT INTO currencies (id, name, short_name, icon, color, hidden_if_zero)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, short_name, icon || null, color, hidden_if_zero ? 1 : 0);
    
    logActivity({
      type: 'Currency',
      target_id: id,
      user: uuid,
      action: 'Created',
    });
    res.status(201).json({ message: 'Currency created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update an existing currency by ID
router.put('/:id', (req, res) => {
    const { id } = req.params; // Extract currency id from the URL
    const { name, short_name, icon, color, hidden_if_zero } = req.body;
    const { uuid } = req.body;
  
    // Basic validation: check that all required fields are provided
    if (!name || !short_name || !color) {
      return res.status(400).json({ error: 'Name, short name, and color are required.' });
    }
  
    try {
      // Check if the currency with the provided ID exists
      const existingCurrency = db.prepare('SELECT * FROM currencies WHERE id = ?').get(id);
      
      if (!existingCurrency) {
        return res.status(404).json({ error: 'Currency not found' });
      }
  
      // Update the currency if it exists
      const update = db.prepare(`
        UPDATE currencies
        SET name = ?, short_name = ?, icon = ?, color = ?, hidden_if_zero = ?
        WHERE id = ?
      `);
  
      const result = update.run(name, short_name, icon || null, color, hidden_if_zero ? 1 : 0, id);
  
      // Check if the update affected any rows (i.e., was there a real update)
      if (result.changes === 0) {
        return res.status(400).json({ error: 'No changes were made to the currency.' });
      }
  
      // Send success response
      res.status(200).json({ message: 'Currency updated successfully' });
      logActivity({
        type: 'Currency',
        target_id: id,
        user: uuid,
        action: 'Edited',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// 5. Delete a currency by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    const result = db.prepare('DELETE FROM currencies WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    res.status(200).json({ message: 'Currency deleted successfully' });
    logActivity({
      type: 'Currency',
      target_id: id,
      user: uuid,
      action: 'Deleted',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
