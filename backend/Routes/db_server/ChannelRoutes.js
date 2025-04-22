const express = require('express');
const router = express.Router();
const db = require('../../db'); // Assuming you're using SQLite database connection
const logActivity = require('../../utils/LogActivity');


function getChannelByName(name) {
  return db.prepare('SELECT * FROM channels WHERE name = ?').get(name);
}

// 1. Get all currencies
router.get('/', (req, res) => {
  try {
    const channels = db.prepare('SELECT * FROM channels').all();
      res.status(200).json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:name', (req, res) => {
  const { name } = req.params;
  
  try {
      const channel = db.prepare('SELECT * FROM channels WHERE name = ?').get(name);
      if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
      res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new currency
router.post('/', (req, res) => {
  const { name, short_name, color, format, default_channel, autojoin, forcejoin, hidden, broadcastable, permission, radius } = req.body;
  const { uuid } = req.body;
  if (!name || !short_name || !color || !format) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = getChannelByName(name);
  if (existing) {
    return res.status(409).json({ error: 'Channel already exists' });
  }

  try {
    db.prepare(`
      INSERT INTO channels (name, short_name, color, format, default_channel, autojoin, forcejoin, hidden, broadcastable, permission, radius)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        name,
        short_name,
        color,
        format,
        default_channel ? 1 : 0,
        autojoin ? 1 : 0,
        forcejoin ? 1 : 0,
        hidden ? 1 : 0,
        broadcastable ? 1 : 0,
        permission,
        radius
    
    );
    
    logActivity({
      type: 'Channel',
      target_id: name,
      user: uuid,
      action: 'Created',
    });
    res.status(201).json({ message: 'Channel created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update an existing currency by ID
router.put('/:name', (req, res) => {
    const { name } = req.params; // Extract currency id from the URL
    const { short_name, color, format, default_channel, autojoin, forcejoin, hidden, broadcastable, permission, radius } = req.body;
    const { uuid } = req.body;
  
    // Basic validation: check that all required fields are provided
    if (!name || !short_name || !color || !format) {
      return res.status(400).json({ error: 'Name, short name, and color are required.' });
    }
  
    try {
      // Check if the currency with the provided ID exists
      const existingChannel = db.prepare('SELECT * FROM channels WHERE name = ?').get(name);
      
        if (!existingChannel) {
        return res.status(404).json({ error: 'Channel not found' });
      }
  
      // Update the currency if it exists
      const update = db.prepare(`
        UPDATE channels 
        short_name = ?,  
        color = ?, 
        format = ?,
        default_channel = ?,
        autojoin = ?,
        forcejoin = ?,
        hidden = ?,
        broadcastable = ?,
        permission = ?,
        radius = ?
        WHERE name = ?
      `);
  
        const result = update.run(
            short_name,
            color,
            format,
            default_channel ? 1 : 0,
            autojoin ? 1 : 0,
            forcejoin ? 1 : 0,
            hidden ? 1 : 0,
            broadcastable ? 1 : 0,
            permission,
            radius,
            name
        );
  
      // Check if the update affected any rows (i.e., was there a real update)
      if (result.changes === 0) {
        return res.status(400).json({ error: 'No changes were made to the Channel.' });
      }
  
      // Send success response
      res.status(200).json({ message: 'Channel updated successfully' });
      logActivity({
        type: 'Channel',
        target_id: name,
        user: uuid,
        action: 'Edited',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// 5. Delete a currency by ID
router.delete('/:name', (req, res) => {
  const { name } = req.params;
  const { uuid } = req.query;

  try {
    const result = db.prepare('DELETE FROM channels WHERE name = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.status(200).json({ message: 'Channel deleted successfully' });
    logActivity({
      type: 'Channel',
      target_id: name,
      user: uuid,
      action: 'Deleted',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
