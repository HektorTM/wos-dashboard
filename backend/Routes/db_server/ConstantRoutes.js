const express = require('express');
const router = express.Router();
const db = require('../../db'); // Now using MySQL connection
const logActivity = require('../../utils/LogActivity');
const e = require("express");


router.get('/', async  (req, res) => {
    try {
        const [constants] = await db.query('SELECT * FROM constants');
        res.status(200).json(constants);

    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
});

router.get('/:id', async  (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`SELECT * FROM constants WHERE id = ?`, [id]);
        const constant = rows[0];

        if (!constant) {
            res.status(404).json({error: 'Constant not Found'});
        }

        res.status(200).json(constant);
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

router.post('/', async (req, res) => {
    const { id, value } = req.body;
    const { uuid } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [existingRows] = await db.query('SELECT * FROM constants WHERE id = ?', [id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Constant with this ID already exists' });
        }


        await db.query('INSERT INTO constants (id, value) VALUES (?,?)', [id, value]);
        await logActivity({
            type: 'constant',
            target_id: id,
            user: uuid,
            action: 'Created',
        });

        res.status(200).json({message: 'Successfully created Constant'});
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;
    try {
        await db.query('DELETE FROM constants WHERE id = ?', [id]);

        await logActivity({
            type: 'constant',
            target_id: id,
            user: uuid,
            action: 'Deleted',
        });
        res.status(200).json({message: 'Successfully deleted Constant'});
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    const { uuid } = req.query;

    if (!value) return res.status(400).json({error: "Value is required."});


    try {
        await db.query('UPDATE constants SET value = ? WHERE id = ?', [value, id]);
        await logActivity({
            type: 'constant',
            target_id: id,
            user: uuid,
            action: 'Edited',
        });
        res.status(200).json({message: 'Successfully updated Constant'});
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

module.exports = router;