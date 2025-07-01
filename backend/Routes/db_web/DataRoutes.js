// Routes/PageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../../webmeta');
const logActivity = require('../../utils/LogActivity');

// 1. Get all page_data entries
router.get('/', async (req, res) => {
  try {
    const [entries] = await db.query('SELECT * FROM page_data');
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a specific page
router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM page_data WHERE type = ? AND id = ?', [type, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page data not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:uuid', async (req, res) => {
  const { uuid } = req.params; 

  try {
    const rows = await db.query('SELECT * FROM page_data WHERE created_by = ?', [uuid]);
    if (rows.length === 0) {
      return res.status(404).json({error: 'Page Data not found'});
    }
    res.status(200).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})

// 3. Create a page
router.post('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { uuid } = req.query;

  try {
    await db.query(`
      INSERT IGNORE INTO page_data (type, id, created_by, edited_by)
      VALUES (?, ?, ?, ?)
    `, [type, id, uuid || null, uuid || null]);

    res.status(201).json({ message: 'Page data created or already exists' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Touch update
router.patch('/:type/:id/touch', async (req, res) => {
  const { type, id } = req.params;
  const { uuid } = req.query;

  try {
    const [result] = await db.query(`
      UPDATE page_data
      SET edited_at = CURRENT_TIMESTAMP, edited_by = ?
      WHERE type = ? AND id = ?
    `, [uuid, type, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json({ message: 'Last edited timestamp updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Lock/Unlock
router.put('/:type/:id/lock', async (req, res) => {
  const { type, id } = req.params;
  const { locked } = req.body;
  const { uuid } = req.query;

  try {
    const [result] = await db.query(`
      UPDATE page_data
      SET locked = ?, edited_by = ?, edited_at = CURRENT_TIMESTAMP
      WHERE type = ? AND id = ?
    `, [locked ? 1 : 0, uuid, type, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    await logActivity({
      type,
      target_id: id,
      user: uuid,
      action: locked ? 'Locked' : 'Unlocked',
    });

    res.status(200).json({ message: `Page successfully ${locked ? 'locked' : 'unlocked'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lock state' });
  }
});

// 6. Delete
router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM page_data WHERE type = ? AND id = ?', [type, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json({ message: 'Page data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
