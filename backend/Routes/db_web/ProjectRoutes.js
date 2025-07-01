const express = require('express');
const router = express.Router();
const db = require('../../webmeta');
const generateUUID = require('../../utils/uuid');

router.get('/', async (req, res) => {
    try {
        const [entries] = await db.query('SELECT * FROM projects');
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [ProjectRows] = await db.query('SELECT 1 FROM projects WHERE id = ?', [id]);
        if (ProjectRows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const [data] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
        const [items] = await db.query('SELECT * FROM project_items WHERE id = ?', [id]);

        res.json({
            data,
            items
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/', async (req, res) => {
    const {id, uuid, title, public} = req.body;

    try {
        await db.query(`
          INSERT INTO projects (id, uuid, public, title)
          VALUES (?, ?, ?, ?)
        `, [id, uuid, public | 0, title]);

        res.status(201).json({ message: 'Project created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
      }
})

router.post('/:id', async (req, res) => {
    const {id} = req.params;
    const { type, item_id, uuid } = req.body;

    try {
        await db.query(`
            INSERT INTO project_items (id, type, item_id, added_by) 
            VALUES (?, ?, ?, ?)
            `, [id, type, item_id, uuid]);

            res.status(201).json({ message: 'Project Item created'});
    } catch (err) {
        res.status(500).json({ error: err.messasge });
    }
})


router.delete('/', async (req, res) => {
    const {id} = req.body;

    try {
        const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    const {type, item_id} = req.body;

    try {
        const [result] = await db.query('DELETE FROM project_items WHERE id = ? AND type = ? AND item_id = ?', [id, type, item_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project Item not found'});
        }
        res.status(200).json({message: 'Project Item deleted'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})