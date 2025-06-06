const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');

// GET /api/playerdata/

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM playerdata');

        res.json(rows);
    } catch (err) {
        res.status(500).json({ errror: err.message });
    }
})

router.get('/username/:uuid', async (req, res) => {
    const { uuid } = req.params;

    try {
        const [username] = await db.query('SELECT username FROM playerdata WHERE uuid = ?', [uuid]);

        res.json(username);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }

})

router.get('/:uuid', async (req, res) => {
    const { uuid } = req.params;

    try {
        const [PlayerRows] = await db.query('SELECT 1 FROM playerdata WHERE uuid = ?', [uuid]);
        if (PlayerRows.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        const [data] = await db.query('SELECT * FROM playerdata WHERE uuid = ?', [uuid]);
        const [nicknames] = await db.query('SELECT * FROM nicknames WHERE uuid = ?', [uuid]);
        const [unlockables] = await db.query('SELECT * FROM playerdata_unlockables WHERE uuid = ?', [uuid]);
        const [stats] = await db.query('SELECT * FROM playerdata_stats WHERE uuid = ?', [uuid]);
        const [friends] = await db.query('SELECT * FROM friends WHERE uuid = ?', [uuid]);
        const [cosmetics] = await db.query('SELECT * FROM player_cosmetics WHERE uuid = ?', [uuid]);
        const [ecologs] = await db.query('SELECT * FROM eco_log WHERE uuid = ?', [uuid]);

        res.json({
            data,
            nicknames,
            unlockables,
            stats,
            friends,
            cosmetics,
            ecologs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;