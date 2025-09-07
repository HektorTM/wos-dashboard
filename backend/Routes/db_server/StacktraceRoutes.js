// routes/admin/luckperms.js
const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL pool/promise connection

router.get('/:uuid', async (req, res) => {
    const { uuid } = req.params;

    try {
        const [rows] = await db.query(
            'SELECT * FROM stacktraces WHERE uuid = ? ORDER BY date DESC',
            [uuid]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .set('Content-Type', 'text/plain')
                .send(`No stack trace found for UUID: ${uuid}`);
        }

        // If you want ALL stack traces for this UUID, build them into one string
        let output = '';
        for (const row of rows) {
            output +=
                `------------- STACK TRACE FROM ${row.date.toISOString()} -----------------
------------- ${row.plugin} | Breakpoint UUID: ${row.traceuuid} -----------------

${row.message}
                
                
${row.trace}
                
                ------------- END OF STACK TRACE -----------------

`;
        }

        res.set('Content-Type', 'text/plain');
        res.status(200).send(output);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
