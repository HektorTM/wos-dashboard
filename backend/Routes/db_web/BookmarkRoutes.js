const express = require('express');
const router = express.Router();
const db = require('../../webmeta');


router.get('/:uuid', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, type, item_id, url, added_at FROM bookmarks WHERE uuid = ?', [req.params.uuid]);

        return res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/:uuid/status', async (req, res) => {
    const { uuid } = req.params
    const { type, item_id } = req.query

    if (!type || !item_id) {
        return res.status(400).json({ error: 'Missing type or item_id' })
    }

    try {
        const [rows] = await db.query(
            'SELECT 1 FROM bookmarks WHERE uuid = ? AND type = ? AND item_id = ? LIMIT 1',
            [uuid, type, item_id]
        )

        const exists = rows.length > 0

        res.status(200).json({ bookmarked: exists })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})


router.post('/:uuid', async (req, res) => {
    const { type, item_id, url } = req.body;

    try {
        const [result] = await db.query('INSERT INTO bookmarks (uuid, type, item_id, url, added_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)', [req.params.uuid, type, item_id, url]);


        res.status(201).json({ id: result.insertId, message: 'Bookmark added' });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.delete('/:uuid/:type/:item_id', async (req, res) => {
    const { uuid, type, item_id } = req.params;


    try {
        await db.query('DELETE FROM bookmarks WHERE uuid = ? AND type = ? AND item_id = ?', [uuid, type, item_id]);

        res.status(201).json({ message: 'Bookmark deleted' });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
})



module.exports = router;