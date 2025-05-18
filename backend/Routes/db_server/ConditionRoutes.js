const express = require('express');
const router = express.Router();
const db = require('../../db'); // Your database connection
const { logActivity } = require('../../utils/LogActivity');

// GET /api/conditions/:type/:id - Get all conditions for a specific type and ID
router.get('/:type/:type_id', async (req, res) => {
  const { type, type_id } = req.params;

  try {
    const [conditions] = await db.query(
      'SELECT * FROM conditions WHERE type = ? AND type_id = ?',
      [type, type_id]
    );

    res.json(conditions.map(row => ({
      condition_id: row.condition_id,
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
router.post('/:type/:type_id', async (req, res) => {
  const { type, type_id } = req.params;
  const { condition_key, value, parameter } = req.body;

  if (!condition_key || !value) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const [maxIdResult] = await db.query(
      'SELECT MAX(condition_id) as maxId FROM conditions WHERE type_id = ? AND type = ?',
      [type_id, type]
    );
    const nextConditionId = (maxIdResult[0].maxId || 0) + 1;

  try {
    await db.query(
      'INSERT INTO conditions (type, type_id, condition_id, condition_key, value, parameter) VALUES (?, ?, ?, ?, ?, ?)',
      [type, type_id, nextConditionId, condition_key, value, parameter || null]
    );

    res.status(201).json({ message: 'Condition added successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add condition' });
  }
});

// PUT /api/conditions/:type/:id/:condition_key - Update a condition
router.put('/:type/:type_id/:condition_id', async (req, res) => {
  const { type, type_id, condition_id } = req.params;
  const { condition_key, value, parameter } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      'UPDATE conditions SET condition_key = ?, value = ?, parameter = ? WHERE type = ? AND type_id = ? AND condition_id = ?',
      [condition_key, value, parameter || null, type, type_id, condition_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    res.json({ message: 'Condition updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update condition' });
  }
});

// DELETE /api/conditions/:type/:id/:condition_key - Delete a condition
router.delete('/:type/:type_id/:condition_id', async (req, res) => {
  const { type, type_id, condition_id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM conditions WHERE type = ? AND type_id = ? AND condition_id = ?',
      [type, type_id, condition_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    res.json({ message: 'Condition deleted successfully' });

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
      'DELETE FROM conditions WHERE type = ? AND type_id = ?',
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