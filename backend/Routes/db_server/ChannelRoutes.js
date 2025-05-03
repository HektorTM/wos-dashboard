const express = require('express');
const router = express.Router();
const db = require('../../db'); // Now using MySQL connection
const logActivity = require('../../utils/LogActivity');

async function getChannelByName(name) {
  const [rows] = await db.query('SELECT * FROM channels WHERE name = ?', [name]);
  return rows[0];
}

// 1. Get all channels
router.get('/', async (req, res) => {
  try {
    const [channels] = await db.query('SELECT * FROM channels');
    res.status(200).json(channels);
  } catch (err) {
    console.error('Channel fetch:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single channel by name
router.get('/:name', async (req, res) => {
  const { name } = req.params;
  
  try {
    const [rows] = await db.query('SELECT * FROM channels WHERE name = ?', [name]);
    const channel = rows[0];
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new channel
router.post('/', async (req, res) => {
  const { name, short_name, color, format, default_channel, autojoin, forcejoin, hidden, broadcastable, permission, radius } = req.body;
  const { uuid } = req.body;
  
  if (!name || !short_name || !color || !format) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if channel exists
    const existing = await getChannelByName(name);
    if (existing) {
      return res.status(409).json({ error: 'Channel already exists' });
    }

    // Insert new channel
    await db.query(`
      INSERT INTO channels (name, short_name, color, format, default_channel, autojoin, forcejoin, hidden, broadcastable, permission, radius)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
    ]);
    
    await logActivity({
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

// 4. Update an existing channel by name
router.put('/:name', async (req, res) => {
  const { name } = req.params;
  const { short_name, color, format, default_channel, autojoin, forcejoin, hidden, broadcastable, permission, radius } = req.body;
  const { uuid } = req.body;

  if (!name || !short_name || !color || !format) {
    return res.status(400).json({ error: 'Name, short name, and color are required.' });
  }

  try {
    // Check if channel exists
    const [existingRows] = await db.query('SELECT * FROM channels WHERE name = ?', [name]);
    if (!existingRows[0]) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Update the channel
    const [result] = await db.query(`
      UPDATE channels 
      SET 
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
    `, [
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
    ]);

    // Check if the update affected any rows
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes were made to the Channel.' });
    }

    // Send success response
    res.status(200).json({ message: 'Channel updated successfully' });
    await logActivity({
      type: 'Channel',
      target_id: name,
      user: uuid,
      action: 'Edited',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete a channel by name
router.delete('/:name', async (req, res) => {
  const { name } = req.params;
  const { uuid } = req.query;

  try {
    const [result] = await db.query('DELETE FROM channels WHERE name = ?', [name]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.status(200).json({ message: 'Channel deleted successfully' });
    await logActivity({
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