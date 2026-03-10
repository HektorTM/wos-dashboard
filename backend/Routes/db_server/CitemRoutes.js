const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL connection pool
const logActivity = require('../../utils/LogActivity');
const e = require("cors");

// 1. Get all currencies
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM citems');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT data FROM citems WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Citem not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const { uuid } = req.query;

  try {
    const [result] = await db.query('UPDATE citems SET data = ? WHERE id = ?', [JSON.stringify(data), id]);

    await logActivity({
      type: 'citem',
      target_id: id,
      user: uuid,
      action: 'Edited',
    })

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

router.post('/', async (req, res) => {
  const { id } = req.body;
  let { data } = req.body;
  const uuid = req.query.uuid || "system";

  try {
    // Convert null -> {}
    if (data === null) {
      data = {};
    }

    const parsedData =
        typeof data === "string" ? JSON.parse(data) : data;

    const [result] = await db.query(
        'INSERT INTO citems (id, data) VALUES (?, ?)',
        [id, JSON.stringify(parsedData)]
    );

    if (result.affectedRows > 0) {

      await logActivity({
        type: 'citem',
        id,
        user: uuid,
        action: 'Created',
      });

      res.status(200).json({
        message: 'Citem created successfully.',
        id,
        data: parsedData
      });

    } else {
      res.status(500).json({ error: 'Failed to create citem' });
    }

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 3. Delete a currency by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    const [result] = await db.query('DELETE FROM citems WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Citem not found' });
    }

    res.status(200).json({ message: 'Citem deleted successfully' });
    await logActivity({
      type: 'Citem',
      target_id: id,
      user: uuid,
      action: 'Deleted',
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
