// Routes/PageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../../webmeta');

router.get('/folders', async (req, res) => {
   try {
       const [rows] = await db.query('SELECT * FROM folders');
       res.status(200).json(rows);
   } catch (e) {
       res.status(500).json({ error: e.message });
   }
});

router.get('/folders/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM folders WHERE id = ?', [req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'folder not found'});
        }

        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/folders', async (req, res) => {
    const { name, parent_id, permission } = req.body;

    try {
        const [rows] = await db.query(`INSERT INTO folders (name, parent_id, permission) VALUES (?,?,?)`, [name, parent_id || null, permission || null]);

        res.status(201).json({ id: rows.insertId, message: 'Folder created'});
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/folders/:id', async (req, res) => {
    const { name, permission } = req.body;

    try {
        const [rows] = await db.query(`UPDATE folders SET permission = ?, name = ? WHERE id = ?`, [permission, name, req.query.id]);

        if (!rows.affectedRows) {
            res.status(404).json({ error: 'Folder not found'});
        }

        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/folders/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM folders WHERE id = ?',
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.status(200).json({ message: 'Folder deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/files', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM files');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/files/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM files WHERE id = ?',
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/files', async (req, res) => {
    const { name, folder_id, content, permission, uuid } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO files (name, folder_id, content, permission, created_by, edited_by, is_locked)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, folder_id, content || null, permission || null, uuid, uuid, false]
        );

        res.status(201).json({ id: result.insertId, message: 'File created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Update file content (like your "touch", but real)
router.put('/files/:id', async (req, res) => {
    const { content, uuid } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE files SET content = ?, edited_by = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [content, uuid, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json({ message: 'File updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/files/:id/lock', async (req, res) => {
    const { locked, uuid } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE files SET is_locked = ?, edited_by = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [locked, uuid, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json({ message: 'File updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Update file permissions
router.patch('/files/:id/permissions', async (req, res) => {
    const { permissions } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE files SET permissions = ? WHERE id = ?`,
            [permissions, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json({ message: 'Permissions updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Delete file
router.delete('/files/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM files WHERE id = ?',
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json({ message: 'File deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/fs/tree
router.get('/tree', async (req, res) => {
    try {
        const [folders] = await db.query(`
      SELECT id, name, parent_id FROM folders
    `)

        const [files] = await db.query(`
      SELECT id, name, permission, folder_id, created_by FROM files
    `)

        // Build lookup
        const map = {}
        folders.forEach(f => {
            map[f.id] = { id: String(f.id), name: f.name, children: [] }
        })

        // Nest folders
        const tree = []
        folders.forEach(f => {
            if (f.parent_id) {
                map[f.parent_id]?.children.push(map[f.id])
            } else {
                tree.push(map[f.id])
            }
        })

        // Attach files
        files.forEach(file => {
            map[file.folder_id]?.children.push({
                id: `${file.name}-${file.id}`,
                name: file.name,
                permission: file.permission,
                created_by: file.created_by,
            })
        })

        res.json(tree)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


module.exports = router;
