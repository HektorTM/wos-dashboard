// routes/admin/luckperms.js
const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL pool/promise connection
const logActivity = require('../../utils/LogActivity');


async function groupExists(name) {
    const [rows] = await db.query(
        'SELECT 1 FROM luckperms_groups WHERE name = ? LIMIT 1',
        [name]
    );
    return rows.length > 0;
}


router.get('/groups', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM luckperms_groups'
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/group/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const [rows] = await db.query(
            'SELECT id, permission, value, server, world FROM luckperms_group_permissions WHERE name = ?', [name]
        )
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/group', async (req, res) => {
    const { name } = req.body;

    if (await groupExists(name)) {
        return res.status(409).json({ error: 'Group already exists' });
    }

    try {
        await db.query(
            'INSERT INTO luckperms_groups (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name', [name]
        );
        res.status(201).json({ message: 'Group created', groupName: name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})

router.delete('/group/:name', async (req, res) => {
    const { name } = req.params;
    if (!groupExists(name)) {
        return res.status(404).json({ error: 'Group not found' });
    }
    try {
        await db.query(
            'DELETE FROM luckperms_groups WHERE name = ?', [name]
        );
        await db.query(
            'DELETE FROM luckperms_group_permissions WHERE name = ?', [name]
        );
        await db.query(
            'DELETE FROM luckperms_user_permissions WHERE permission LIKE ?', [`%group.${name}%`]
        )
        res.status(200).json({ message: 'Group deleted', groupName: name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/group/:name/permission', async (req, res) => {
   const { name } = req.params;
   const { permission } = req.body;

    if (!groupExists(name)) {
         return res.status(404).json({ error: 'Group not found' });
    }

    try {
        await db.query(
            'INSERT INTO luckperms_group_permissions (name, permission, value, server, world, expiry, contexts) VALUES (?, ?, 1, "global", "global", 0, "{}") ON DUPLICATE KEY UPDATE value = 1', [name, permission]
        );
        res.status(201).json({message: 'Permission added to group', groupName: name, permission});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/group/:name/permission', async (req, res) => {
    const { name } = req.params;
    const { permission } = req.body;

    if (!groupExists(name)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    try {
        await db.query(
            'DELETE FROM luckperms_group_permissions WHERE name = ? AND permission = ?', [name, permission]
        );
        res.status(200).json({ message: 'Permission removed from group', groupName: name, permission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/:uuid', async (req, res) => {
    const { uuid } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT id, permission, value, server, world FROM luckperms_user_permissions WHERE uuid = ? AND value = 1', [uuid]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /admin/luckperms/user/:uuid/permissions
router.get('/user/:uuid/permissions', async (req, res) => {
    const { uuid } = req.params;

    try {
        // 1) Groups the user is in
        const [groupRows] = await db.query(
            `SELECT REPLACE(permission, 'group.', '') AS name
             FROM luckperms_user_permissions
             WHERE uuid = ? AND value = 1 AND permission LIKE 'group.%'`,
            [uuid]
        );
        const groups = groupRows.map(r => r.name);

        // 2) Direct user permissions (exclude group.*)
        const [userPermRows] = await db.query(
            `SELECT permission
             FROM luckperms_user_permissions
             WHERE uuid = ? AND value = 1 AND permission NOT LIKE 'group.%'`,
            [uuid]
        );
        const userPermissions = userPermRows.map(r => r.permission);

        // 3) Group permissions
        let groupPermissions = [];
        if (groups.length > 0) {
            const placeholders = groups.map(() => '?').join(',');
            const [gpRows] = await db.query(
                `SELECT permission
                 FROM luckperms_group_permissions
                 WHERE value = 1 AND name IN (${placeholders})`,
                groups
            );
            groupPermissions = gpRows.map(r => r.permission);
        }

        // 4) Combine all into one list (deduplicated)
        const allPermissions = Array.from(new Set([...userPermissions, ...groupPermissions]));

        res.status(200).json(allPermissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.post('/user/:uuid/permission', async (req, res) => {
    const { uuid } = req.params;
    const { permission } = req.body;

    try {
        await db.query(
            'INSERT INTO luckperms_user_permissions (uuid, permission, value, server, world, expiry, contexts) VALUES (?, ?, 1, "global", "global", 0, "{}") ON DUPLICATE KEY UPDATE value = 1', [uuid, permission]
        );
        res.status(201).json({ message: 'Permission added to user', uuid, permission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})

router.get('/user/:uuid/groups', async (req, res) => {
    const { uuid } = req.params;

    try {
        const [groups] = await db.query('SELECT permission FROM luckperms_user_permissions WHERE uuid = ? AND value = 1 AND permission LIKE "group.%"', [uuid]);
        const rGroups = groups.map(r => r.permission);
        return res.status(200).json(rGroups);
    } catch (e) {
        console.error(e);
    }
})

router.post('/user/:uuid/group', async (req, res) => {
    const { uuid } = req.params;
    const { group } = req.body;

    if (!groupExists(group)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    try {
        await db.query(
            'INSERT INTO luckperms_user_permissions (uuid, permission, value, server, world, expiry, contexts) VALUES (?, ?, 1, "global", "global", 0, "{}") ON DUPLICATE KEY UPDATE value = 1', [uuid, `group.${group}`]
        );
        res.status(201).json({ message: 'User added to group', uuid, group });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/user/:uuid/permission', async (req, res) => {
    const { uuid } = req.params;
    const { permission } = req.body;

    try {
        await db.query(
            'DELETE FROM luckperms_user_permissions WHERE uuid = ? AND permission = ?', [uuid, permission]
        );
        res.status(200).json({ message: 'Permission removed from user', uuid, permission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/user/:uuid/group', async (req, res) => {
    const { uuid } = req.params;
    const { group } = req.body;

    try {
        await db.query(
            'DELETE FROM luckperms_user_permissions WHERE uuid = ? AND permission = ?', [uuid, `group.${group}`]
        );
        res.status(200).json({ message: 'Permission group removed from player', uuid, group });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM permission_list');
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
