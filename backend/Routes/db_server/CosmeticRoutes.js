const express = require('express');
const router = express.Router();
const db = require('../../db'); // Assuming you're using SQLite database connection
const logActivity = require('../../utils/LogActivity');



function getCosmeticByID(id) {
    return db.prepare('SELECT * FROM cosmetics WHERE id = ?').get(id);
}

// 1. Get all cosmetics
router.get('/', (req, res) => {
    try {
        const cosmetics = db.prepare('SELECT * FROM cosmetics').all();
        res.status(200).json(cosmetics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get a single cosmetic by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const cosmetic = db.prepare('SELECT * FROM cosmetics WHERE id = ?').get(id);
        if (!cosmetic) {
            return res.status(404).json({ error: 'Cosmetic not found' });
        }
        res.status(200).json(cosmetic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create a new cosmetic
router.post('/', (req, res) => {
    const { type, id, display, description} = req.body;
    const { uuid } = req.body;
    if (!type || !id || !display || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = getCosmeticByID(id);
    if (existing) {
        return res.status(409).json({ error: 'Cosmetic already exists' });
    }

    try {
        db.prepare(`
      INSERT INTO cosmetics (type, id, display, description)
      VALUES (?, ?, ?, ?)
    `).run(type, id, display, description);

        logActivity({
            type: `${type}`,
            target_id: id,
            user: uuid,
            action: 'Created',
        });
        res.status(201).json({ message: 'Cosmetic created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update an existing currency by ID
router.put('/:id', (req, res) => {
    const { id } = req.params; // Extract currency id from the URL
    const { type, display, description} = req.body;
    const { uuid } = req.body;

    // Basic validation: check that all required fields are provided
    if (!display || !description) {
        return res.status(400).json({ error: 'Display and Description are required.' });
    }

    try {
        // Check if the cosmetic with the provided ID exists
        const existingCosmetic = db.prepare('SELECT * FROM cosmetics WHERE id = ?').get(id);

        if (!existingCosmetic) {
            return res.status(404).json({ error: 'Cosmetics not found' });
        }

        // Update the currency if it exists
        const update = db.prepare(`
        UPDATE cosmetics
        SET type = ?, display = ?, description = ?
        WHERE id = ?
      `);

        const result = update.run(type, display, description, id);

        // Check if the update affected any rows (i.e., was there a real update)
        if (result.changes === 0) {
            return res.status(400).json({ error: 'No changes were made to the cosmetic.' });
        }

        // Send success response
        res.status(200).json({ message: 'Cosmetic updated successfully' });
        logActivity({
            type: `${type}`,
            target_id: id,
            user: uuid,
            action: 'Edited',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 5. Delete a cosmetic by ID
router.delete('/:id', (req, res) => {
    const { type, id } = req.params;
    const { uuid } = req.query;

    try {
        const result = db.prepare('DELETE FROM cosmetics WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Cosmetic not found' });
        }

        res.status(200).json({ message: 'Cosmetic deleted successfully' });
        logActivity({
            type: `${type}`,
            target_id: id,
            user: uuid,
            action: 'Deleted',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
