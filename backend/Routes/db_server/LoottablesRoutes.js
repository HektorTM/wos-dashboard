const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');


router.get('/:id', async (req, res) => {
    try {
        const [lts] = await db.query('SELECT * FROM loottables');
        res.json(lts);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err.message);
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [items] = await db.query('SELECT * FROM loottable_items WHERE loottable_id = ?', [id]);
        if (!items || !items.length) {
            return res.status(404).json({error: 'Not found'});
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err.message);
    }
})

router.post('/', async (req, res) => {
    const { uuid } = req.query;
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required.' });
    }

    try {
        const [existingRows] = await db.query('SELECT * FROM loottables WHERE id = ?', [id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Loottable with this ID already exists' });
        }

        await db.query('INSERT INTO loottables (id) VALUES (?)', [id]);

        await logActivity({
            type: 'loottable',
            target_id: id,
            user: uuid,
            action: 'Created',
        });

        res.json({message: 'Loot tables created'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;
    try {
        await db.query('DELETE FROM loottable_items WHERE id = ?', [id]);
        await db.query('DELETE FROM loottables WHERE id = ?', [id]);

        await logActivity({
            type: 'loottable',
            target_id: id,
            user: uuid,
            action: 'Deleted',
        });


        res.json({message: 'Loot tables deleted'});
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err.message);
    }
})

router.get('/:id/items', async (req, res) => {

})

module.exports = router;