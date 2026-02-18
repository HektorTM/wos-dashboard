const express = require('express');
const router = express.Router();
const db = require('../../db'); // Now using MySQL connection
const logActivity = require('../../utils/LogActivity');
const e = require("express");


router.get('/', async  (req, res) => {
    try {
        const [commands] = await db.query('SELECT * FROM commands');
        res.status(200).json(commands);

    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
});

router.get('/:id', async  (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`SELECT * FROM commands WHERE command = ?`, [id]);
        const command = rows[0];

        if (!command) {
            res.status(404).json({error: 'Command not Found'});
        }

        res.status(200).json(command);
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

router.post('/', async (req, res) => {
    const { id, interaction, permission } = req.body;
    const { uuid } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [existingRows] = await db.query('SELECT * FROM commands WHERE command = ?', [id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Command already exists' });
        }


        await db.query('INSERT INTO commands (command, interaction, permission) VALUES (?,?, ?)', [id, interaction, permission ?? null]);
        const [rows] = await db.query(
            'SELECT * FROM commands WHERE command = ?',
            [id]
        );

        await logActivity({
            type: 'command',
            target_id: id,
            user: uuid,
            action: 'Created',
        });

        res.status(201).json(rows[0]);
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;
    try {
        await db.query('DELETE FROM commands WHERE command = ?', [id]);

        await logActivity({
            type: 'command',
            target_id: id,
            user: uuid,
            action: 'Deleted',
        });
        res.status(200).json({message: 'Successfully deleted Command'});
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { permission, interaction } = req.body;
    const { uuid } = req.query;

    if (!interaction) return res.status(400).json({error: "Value is required."});


    try {
        await db.query('UPDATE commands SET permission = ?, interaction = ? WHERE command = ?', [permission, interaction, id]);
        await logActivity({
            type: 'command',
            target_id: id,
            user: uuid,
            action: 'Edited',
        });
        res.status(200).json({message: 'Successfully updated Command'});
    } catch (e) {
        res.status(500).json({error: e});
        console.log(e);
    }
})

module.exports = router;