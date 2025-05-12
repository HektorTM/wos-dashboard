const express = require('express');
const router = express.Router();
const db = require('../../db'); // Your database connection
const { logActivity } = require('../../utils/LogActivity');

// Condition types mapping
const ConditionType = {
  INTERACTION_ACTION: 'INTERACTION_ACTION',
  // Add other condition types as needed
};

// GET /api/conditions/:type/:id - Get all conditions for a specific type and ID
router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const [conditions] = await db.query(
      'SELECT * FROM conditions WHERE type = ? AND id = ?',
      [type, id]
    );

    res.json(conditions.map(row => ({
      condition_key: row.condition_key,
      value: row.value,
      parameter: row.parameter
    })));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
});

// POST /api/conditions/:type/:id - Add a new condition
router.post('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { condition_key, value, parameter } = req.body;

  if (!condition_key || !value) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      'INSERT INTO conditions (type, id, condition_key, value, parameter) VALUES (?, ?, ?, ?, ?)',
      [type, id, condition_key, value, parameter || null]
    );

    res.status(201).json({ message: 'Condition added successfully' });

    logActivity({
      type: 'Condition',
      target_id: `${type}/${id}`,
      user: req.user?.id,
      action: 'Created',
      details: condition_key
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Condition already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to add condition' });
  }
});

// PUT /api/conditions/:type/:id/:condition_key - Update a condition
router.put('/:type/:id/:condition_key', async (req, res) => {
  const { type, id, condition_key } = req.params;
  const { value, parameter } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      'UPDATE conditions SET value = ?, parameter = ? WHERE type = ? AND id = ? AND condition_key = ?',
      [value, parameter || null, type, id, condition_key]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    res.json({ message: 'Condition updated successfully' });

    logActivity({
      type: 'Condition',
      target_id: `${type}/${id}`,
      user: req.user?.id,
      action: 'Updated',
      details: condition_key
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update condition' });
  }
});

// DELETE /api/conditions/:type/:id/:condition_key - Delete a condition
router.delete('/:type/:id/:condition_key', async (req, res) => {
  const { type, id, condition_key } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM conditions WHERE type = ? AND id = ? AND condition_key = ?',
      [type, id, condition_key]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    res.json({ message: 'Condition deleted successfully' });

    logActivity({
      type: 'Condition',
      target_id: `${type}/${id}`,
      user: req.user?.id,
      action: 'Deleted',
      details: condition_key
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete condition' });
  }
});

// DELETE /api/conditions/:type/:id - Delete all conditions for a type/id
router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM conditions WHERE type = ? AND id = ?',
      [type, id]
    );

    res.json({ 
      message: 'Conditions deleted successfully',
      count: result.affectedRows
    });

    logActivity({
      type: 'Condition',
      target_id: `${type}/${id}`,
      user: req.user?.id,
      action: 'Deleted All'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete conditions' });
  }
});

module.exports = router;