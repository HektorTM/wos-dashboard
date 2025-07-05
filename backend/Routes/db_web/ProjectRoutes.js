const express = require('express');
const router = express.Router();
const db = require('../../webmeta');
const logActivity = require("../../utils/LogActivity");

router.get('/', async (req, res) => {
    try {
        const [entries] = await db.query('SELECT * FROM projects');
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    // Update given details through body, can be only one or more
    const { id } = req.params;
    const { name, publicState, notes } = req.body;
    const updates = [];
    const values = [];
    if (name) {
        updates.push('name = ?');
        values.push(name);
    }
    if (publicState !== null) {
        updates.push('public = ?');
        values.push(publicState ? 1 : 0);
    }
    if (notes) {
        updates.push('notes = ?');
        values.push(notes);
    }
    values.push(id);

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    try {
        const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ message: 'Project updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [ProjectRows] = await db.query('SELECT 1 FROM projects WHERE id = ?', [id]);
        if (ProjectRows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const [data] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
        const [items] = await db.query('SELECT * FROM project_items WHERE id = ?', [id]);
        const [users] = await db.query('SELECT * FROM project_members WHERE id = ?', [id]);

        res.json({
            data,
            items,
            users
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/user', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    try {
        await db.query(`INSERT INTO project_members (id, uuid) VALUES (?,?)`, [id, uuid]);

        res.status(201).json({message: 'Member added'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})

router.delete('/:id/user', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    try {
        await db.query(`DELETE FROM project_members WHERE id = ? AND uuid = ?`, [id, uuid]);

        res.status(201).json({message: 'Member was removed'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})


router.post('/', async (req, res) => {
    const {id, uuid, name, publicState} = req.body;

    try {
        await db.query(`
          INSERT INTO projects (id, uuid, public, name)
          VALUES (?, ?, ?, ?)
        `, [id, uuid, publicState | 0, name]);



        logActivity({
            type: 'Project',
            target_id: name,
            user: uuid,
            action: 'Created',
        });
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

router.post('/:id/join', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    try {
        // Check if the project exists
        const [projectRows] = await db.query('SELECT 1 FROM projects WHERE id = ?', [id]);
        if (projectRows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the user is already a member
        const [memberRows] = await db.query('SELECT 1 FROM project_members WHERE id = ? AND uuid = ?', [id, uuid]);
        if (memberRows.length > 0) {
            return res.status(400).json({ error: 'User is already a member of this project' });
        }

        // Add the user to the project members
        await db.query('INSERT INTO project_members (id, uuid) VALUES (?, ?)', [id, uuid]);

        res.status(201).json({ message: 'Joined project successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post('/:id/leave', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.body;

    try {
        // Check if the project exists
        const [projectRows] = await db.query('SELECT 1 FROM projects WHERE id = ?', [id]);
        if (projectRows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the user is a member
        const [memberRows] = await db.query('SELECT 1 FROM project_members WHERE id = ? AND uuid = ?', [id, uuid]);
        if (memberRows.length === 0) {
            return res.status(400).json({ error: 'User is not a member of this project' });
        }

        // Remove the user from the project members
        await db.query('DELETE FROM project_members WHERE id = ? AND uuid = ?', [id, uuid]);

        res.status(200).json({ message: 'Left project successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;

    try {
        const [name] = await db.query('SELECT name FROM projects WHERE id = ?', [id]);
        await db.query(`DELETE FROM project_items WHERE id = ?`, [id]);
        await db.query(`DELETE FROM project_members WHERE id = ?`, [id]);
        const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        logActivity({
            type: 'Project',
            target_id: name[0].name,
            user: uuid,
            action: 'Deleted',
        });
        res.status(200).json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.delete('/:id/items', async (req, res) => {
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


module.exports = router;