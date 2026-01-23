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

router.post('/:uuid', async (req, res) => {
    const { type, item_id, url } = req.body;

    try {
        const [result] = await db.query('INSERT INTO bookmarks (uuid, type, item_id, url, added_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)', [req.params.uuid, type, item_id, url]);


        res.status(201).json({ id: result.insertId, message: 'Bookmark added' });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM bookmarks WHERE id = ?', id);

        res.status(201).json({ message: 'Bookmark deleted' });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
})



module.exports = router;