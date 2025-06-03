const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection
const logActivity = require('../../utils/LogActivity');

// Utility: Get currency by ID
async function getCurrencyByID(id) {
  const [rows] = await db.query('SELECT * FROM currencies WHERE id = ?', [id]);
  return rows[0];
}

// 1. Get all currencies
router.get('/', async (req, res) => {
  try {
    const [currencies] = await db.query('SELECT * FROM currencies');
    res.status(200).json(currencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get a single currency by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const currency = await getCurrencyByID(id);
    if (!currency) return res.status(404).json({ error: 'Currency not found' });
    res.status(200).json(currency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new currency
router.post('/', async (req, res) => {
  const { id, name, short_name, icon, color, hidden_if_zero, uuid } = req.body;

  if (!id || !name || !short_name || !color) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await getCurrencyByID(id);
    if (existing) return res.status(409).json({ error: 'Currency already exists' });

    await db.query(`
      INSERT INTO currencies (id, name, short_name, icon, color, hidden_if_zero)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [parseID(id), name, short_name, icon || null, color, hidden_if_zero ? 1 : 0]);

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

// 4. Update a currency
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, short_name, icon, color, hidden_if_zero, uuid } = req.body;

  if (!name || !short_name || !color) {
    return res.status(400).json({ error: 'Name, short name, and color are required.' });
  }

  try {
    const existing = await getCurrencyByID(id);
    if (!existing) return res.status(404).json({ error: 'Currency not found' });

    const [result] = await db.query(`
      UPDATE currencies
      SET name = ?, short_name = ?, icon = ?, color = ?, hidden_if_zero = ?
      WHERE id = ?
    `, [name, short_name, icon || null, color, hidden_if_zero ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes were made to the currency.' });
    }

    logActivity({
      type: 'Currency',
      target_id: id,
      user: uuid,
      action: 'Edited',
    });

    res.status(200).json({ message: 'Currency updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete a currency
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    const [result] = await db.query('DELETE FROM currencies WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    logActivity({
      type: 'Currency',
      target_id: id,
      user: uuid,
      action: 'Deleted',
    });

    res.status(200).json({ message: 'Currency deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
