const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection
const logActivity = require('../../utils/LogActivity');

// Utility: Get currency by ID
async function getActivityByID(id) {
    const [rows] = await db.query('SELECT * FROM activities WHERE id = ?', [id]);
    return rows[0];
}

// 1. Get all time events
router.get('/', async (req, res) => {
    try {
        const [timeevents] = await db.query('SELECT * FROM activities');
        res.status(200).json(timeevents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get a single currency by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const activity = await getActivityByID(id);
        if (!activity) return res.status(404).json({ error: 'Time Event not found' });
        res.status(200).json(activity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create a new currency
router.post('/', async (req, res) => {
    const { id, name, message, isDefault, date, start_time, end_time, start_interaction, end_interaction, uuid } = req.body;

    if (!id || !name || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existing = await getActivityByID(id);
        if (existing) return res.status(409).json({ error: 'Time Event already exists' });

        await db.query(`
      INSERT INTO activities (id, name, message, isDefault, date, start_time, end_time, start_interaction, end_interaction)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, message || null, isDefault ? 1 : 0, date || null, start_time, end_time, start_interaction || null, end_interaction || null]);

        logActivity({
            type: 'Time Event',
            target_id: id,
            user: uuid,
            action: 'Created',
        });

        res.status(201).json({ message: 'Time Event created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update a currency
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, message, isDefault, date, start_time, end_time, start_interaction, end_interaction, uuid} = req.body;

    if (!name || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existing = await getActivityByID(id);
        if (!existing) return res.status(404).json({ error: 'Time Event not found' });

        const [result] = await db.query(`
      UPDATE activities
      SET name = ?,
          message = ?,
          isDefault = ?,
          date = ?,
          start_time = ?,
          end_time = ?,
          start_interaction = ?,
          end_interaction = ?
      WHERE id = ?
    `, [name, message || null, isDefault ? 1 : 0, date, start_time, end_time, start_interaction || null, end_interaction || null, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No changes were made to the Time Event.' });
        }

        logActivity({
            type: 'Time Event',
            target_id: id,
            user: uuid,
            action: 'Edited',
        });

        res.status(200).json({ message: 'Time Event updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete a currency
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;

    try {
        const [result] = await db.query('DELETE FROM activities WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Time Event not found' });
        }

        logActivity({
            type: 'Time Event',
            target_id: id,
            user: uuid,
            action: 'Deleted',
        });

        res.status(200).json({ message: 'Time Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
