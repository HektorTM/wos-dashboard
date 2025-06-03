const express = require('express');
const router = express.Router();
const db = require('../../db'); // Now using MySQL connection
const logActivity = require('../../utils/LogActivity');
const { parseID } = require('../../utils/IDparser');

async function getCosmeticByID(id) {
    const [rows] = await db.query('SELECT * FROM cosmetics WHERE id = ?', [id]);
    return rows[0];
}

async function getTypeByID(id) {
    const [rows] = await db.query('SELECT type FROM cosmetics WHERE id = ?', [id]);
    return rows[0]?.type;
}

// 1. Get all cosmetics
router.get('/', async (req, res) => {
    try {
        const [cosmetics] = await db.query('SELECT * FROM cosmetics');
        res.status(200).json(cosmetics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get a single cosmetic by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM cosmetics WHERE id = ?', [id]);
        const cosmetic = rows[0];
        
        if (!cosmetic) {
            return res.status(404).json({ error: 'Cosmetic not found' });
        }
        res.status(200).json(cosmetic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create a new cosmetic
router.post('/', async (req, res) => {
    const { type, id, display, description } = req.body;
    const { uuid } = req.body;
    
    if (!type || !id || !display || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if cosmetic exists
        const existing = await getCosmeticByID(id);
        if (existing) {
            return res.status(409).json({ error: 'Cosmetic already exists' });
        }

        // Insert new cosmetic
        await db.query(`
            INSERT INTO cosmetics (type, id, display, description)
            VALUES (?, ?, ?, ?)
        `, [type, parseID(id), display, description]);
        
        await logActivity({
            type: type,
            target_id: id,
            user: uuid,
            action: 'Created',
        });
        
        res.status(201).json({ message: 'Cosmetic created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update an existing cosmetic by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { type, display, description } = req.body;
    const { uuid } = req.body;

    if (!display || !description) {
        return res.status(400).json({ error: 'Display and Description are required.' });
    }

    try {
        // Check if cosmetic exists
        const [existingRows] = await db.query('SELECT * FROM cosmetics WHERE id = ?', [id]);
        if (!existingRows[0]) {
            return res.status(404).json({ error: 'Cosmetic not found' });
        }

        // Update the cosmetic
        const [result] = await db.query(`
            UPDATE cosmetics
            SET type = ?, display = ?, description = ?
            WHERE id = ?
        `, [type, display, description, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No changes were made to the cosmetic.' });
        }

        res.status(200).json({ message: 'Cosmetic updated successfully' });
        await logActivity({
            type: type,
            target_id: id,
            user: uuid,
            action: 'Edited',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete a cosmetic by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;
    
    try {
        const type = await getTypeByID(id);
        await db.query('DELETE FROM player_cosmetics WHERE cosmetic_id = ?', [id]);
        const [result] = await db.query('DELETE FROM cosmetics WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cosmetic not found' });
        }

        res.status(200).json({ message: 'Cosmetic deleted successfully' });
        await logActivity({
            type: type,
            target_id: id,
            user: uuid,
            action: 'Deleted',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;