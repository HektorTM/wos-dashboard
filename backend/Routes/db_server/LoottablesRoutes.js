const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');


router.get('/', async (req, res) => {
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

router.get('/:id/settings', async (req, res) => {
    const { id } = req.params;

    try {
        const [items] = await db.query('SELECT * FROM loottables WHERE id = ?', [id]);
        if (!items || !items.length) {
            return res.status(404).json({error: 'Not found'});
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err.message);
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { amount, name } = req.body;

    if (!amount) {
        return res.status(400).json({message: 'Amount is required.'});
    }

    try {
        await db.query('UPDATE loottables SET amount = ?, name = ? WHERE id = ?', [amount, name || null, id]);
        res.status(200).json({message: 'Loottable successfully updated'});
    } catch (error) {
        console.error(error);
    }

})

router.post('/', async (req, res) => {
    const { uuid } = req.query;
    const { id, amount, name } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required.' });
    }

    try {
        const [existingRows] = await db.query('SELECT * FROM loottables WHERE id = ?', [id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Loottable with this ID already exists' });
        }

        await db.query('INSERT INTO loottables (id, amount, name) VALUES (?, ?, ?)', [id, amount || 0, name || ""]);

        const [rows] = await db.query('SELECT * FROM loottables WHERE id = ?', [id]);

        await logActivity({
            type: 'loottable',
            target_id: id,
            user: uuid,
            action: 'Created',
        });

        res.json(rows[0]);
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
    const { id } = req.params;
    try {
        const [items] = await db.query('SELECT * FROM loottable_items WHERE loottable_id = ? ', [id]);
        if (!items || !items.length) {
            return res.status(404).json({error: 'Not found'});
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err.message);
    }
})

router.post('/:id/item', async (req, res) => {
    const { id } = req.params;
    const { weight, type, value, parameter } = req.body;

    if (!weight || !type || !value) {
        return res.status(400).json({error: "Required fields missing."})
    }

    try {
        const [maxIdResult] = await db.query(
            'SELECT MAX(item_id) as maxId FROM loottable_items WHERE loottable_id = ?',
            [id]
        );
        const nextPageId = (maxIdResult[0].maxId || 0) + 1;

        await db.query('INSERT INTO loottable_items (loottable_id, item_id, weight, type, value, parameter) VALUES (?,?,?,?,?,?)', [id, nextPageId, weight, type, value, parameter ?? null]);

        res.status(200).json({message: 'Loottable item created'});
    } catch (e) {
        res.status(500).json({ error: e.message });
        console.log(e.message);
    }

});

router.delete('/:id/item/:itemId', async (req, res) => {
    const { id, itemId } = req.params;

    try {
        await db.query('DELETE FROM loottable_items WHERE loottable_id = ? AND item_id = ?', [id, itemId]);
        res.status(200).json({message: 'Loottable item deleted'});
    } catch (e) {
        res.status(500).json({ error: e.message });
        console.log(e.message);
    }
})

router.patch('/:id/item/:itemId', async (req, res) => {
    const { id, itemId } = req.params;
    const { weight, type, value, parameter } = req.body;

    try {
        await db.query('UPDATE loottable_items SET weight = ?, type = ?, value = ?, parameter = ? WHERE loottable_id = ? AND item_id = ?', [weight, type, value, parameter ?? null, id, itemId]);
        res.status(200).json({message: 'Loottable item updated'});
    } catch (e) {
        res.status(500).json({ error: e.message });
        console.log(e.message);
    }
})

module.exports = router;