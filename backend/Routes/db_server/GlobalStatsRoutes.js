const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');

// 1. Get all stats
router.get('/', async (req, res) => {
    try {
        const [stats] = await db.query('SELECT * FROM global_stats');
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get a single stats by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM global_stats WHERE id = ?', [id]);
        const stat = rows[0];

        if (!stat) {
            return res.status(404).json({ error: 'Global Stat not found' });
        }

        res.status(200).json(stat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create a new unlockable
router.post('/', async (req, res) => {
    const { id, max, capped, uuid } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {

        const [existingRows] = await db.query('SELECT * FROM global_stats WHERE id = ?', [id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Global Stat with this ID already exists' });
        }

        await db.query('INSERT INTO global_stats (id, max, capped, value) VALUES (?, ?, ?, ?)', [id, max, capped ? 1 : 0, 0]);

        res.status(201).json({ message: 'Global Stat created successfully' });

        logActivity({
            type: 'GlobalStat',
            target_id: id,
            user: uuid,
            action: 'Created',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update an existing unlockable
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { max, capped, uuid } = req.body;

    try {
        const [existingRows] = await db.query('SELECT * FROM global_stats WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Global Stat not found' });
        }

        const [result] = await db.query('UPDATE global_stats SET max = ?, capped = ? WHERE id = ?', [max, capped ? 1 : 0, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No changes were made to the Global Stat.' });
        }

        res.status(200).json({ message: 'Global Stat updated successfully' });

        logActivity({
            type: 'GlobalStat',
            target_id: id,
            user: uuid,
            action: 'Edited',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
});

// 5. Delete unlockable
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;

    try {
        const [result] = await db.query('DELETE FROM global_stats WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Global Stat not found' });
        }

        res.status(200).json({ message: 'Global Stat deleted successfully' });

        try {
            logActivity({
                type: 'GlobalStat',
                target_id: id,
                user: uuid,
                action: 'Deleted',
            });
        } catch (logErr) {
            console.error('Logging failed:', logErr);
        }
    } catch (err) {
        console.error('DELETE stat error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
