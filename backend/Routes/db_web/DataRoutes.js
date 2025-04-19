const express = require('express');
const router = express.Router();
const db = require('../../webmeta'); // Your SQLite instance
const logActivity = require('../../utils/LogActivity');

// 1. Get all page_data entries
router.get('/', (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM page_data').all();
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get page_data for a specific type and id
router.get('/:type/:id', (req, res) => {
  const { type, id } = req.params;

  try {
    const page = db.prepare('SELECT * FROM page_data WHERE type = ? AND id = ?').get(type, id);
    if (!page) {
      return res.status(404).json({ error: 'Page data not found' });
    }
    res.status(200).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new page_data entry
router.post('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const { uuid } = req.query;  
  if (!type || !id) {
    return res.status(400).json({ error: 'Missing required fields: type or id' });
  }

  try {
    db.prepare(`
      INSERT INTO page_data (type, id, created_by, edited_by)
      VALUES (?, ?, ?, ?)
    `).run(type, id, uuid || null, uuid || null);

    res.status(201).json({ message: 'Page data created or already exists' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update fields like edited_by, locked, etc.
router.patch('/:type/:id/touch', (req, res) => {
    const { type, id } = req.params;
    const { uuid } = req.query;
  
    try {
      const stmt = db.prepare(`
        UPDATE page_data
        SET edited_at = CURRENT_TIMESTAMP,
            edited_by = ?
        WHERE type = ? AND id = ?
      `);
  
      const result = stmt.run(uuid, type, id);
  
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }
  
      res.status(200).json({ message: 'Last edited timestamp updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

router.put('/:type/:id/lock', (req, res) => {
    const { type, id } = req.params;
    const { locked } = req.body;
    const { uuid } = req.query;
  
    if (typeof locked !== 'boolean') {
      return res.status(400).json({ error: '`locked` must be a boolean' });
    }
  
    try {
      const stmt = db.prepare(`
        UPDATE page_data
        SET locked = ?, edited_by = ?, edited_at = CURRENT_TIMESTAMP
        WHERE type = ? AND id = ?
      `);
      const result = stmt.run(locked ? 1 : 0, uuid, type, id);
  
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Page data not found' });
      }
  
      logActivity({
        type: type,
        target_id: id,
        user: uuid,
        action: locked ? 'Locked' : 'Unlocked',
      });
  
      res.status(200).json({ message: `Page successfully ${locked ? 'locked' : 'unlocked'}` });
    } catch (err) {
      console.error('Lock update failed:', err);
      res.status(500).json({ error: 'Failed to update lock state' });
    }
  });

// 5. Delete a page_data entry
router.delete('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const { uuid } = req.query;

  try {
    const result = db.prepare('DELETE FROM page_data WHERE type = ? AND id = ?').run(type, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Page data not found' });
    }

    res.status(200).json({ message: 'Page data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
