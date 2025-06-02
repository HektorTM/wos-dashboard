const express = require('express');
const router = express.Router();
const db = require('../../webmeta.js');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const logActivity = require('../../utils/LogActivity.js');
const requireAuth = require('../../middleware/auth.js');

async function fetchUsername(uuid) {
  try {
    const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
    const data = await response.json();
    return data.name;
  } catch {
    return null;
  }
}

// Helpers
async function getUserByUUID(uuid) {
  const [rows] = await db.query('SELECT * FROM users WHERE uuid = ?', [uuid]);
  return rows[0];
}

async function getUsernameByUUID(uuid) {
  const [rows] = await db.query('SELECT username FROM users WHERE uuid = ?', [uuid]);
  return rows[0]?.username;
}

async function updateUsername(uuid) {
  const newUsername = await fetchUsername(uuid);
  if (!newUsername) return null;
  await db.query('UPDATE users SET username = ? WHERE uuid = ?', [newUsername, uuid]);
  return newUsername;
}

// --- Register ---
router.post('/register', async (req, res) => {
  const { uuid, password, permissions, editorUUID } = req.body;

  if (!uuid || !password) {
    return res.status(400).json({ error: 'UUID and password are required' });
  }

  const existing = await getUserByUUID(uuid);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const username = await fetchUsername(uuid);
  if (!username) {
    return res.status(404).json({ error: 'Invalid Minecraft UUID' });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.query(
      'INSERT INTO users (uuid, username, permissions, password_hash) VALUES (?, ?, ?, ?)',
      [uuid, username, permissions, hashed]
    );

    await logActivity({
      type: 'User',
      target_id: uuid,
      user: editorUUID,
      action: 'Created',
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  const { resolvedUUID, password } = req.body;

  if (!resolvedUUID || !password) {
    return res.status(400).json({ error: 'UUID and password are required' });
  }

  const user = await getUserByUUID(resolvedUUID);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.is_active) {
    return res.status(403).json({ error: 'Account is deactivated. Please contact admin.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  req.session.user = {
    uuid: user.uuid,
    username: user.username,
  };

  await db.query('UPDATE users SET last_login = ? WHERE uuid = ?', [new Date(), user.uuid]);

  const currentUsername = await getUsernameByUUID(resolvedUUID);
  if (currentUsername !== await fetchUsername(resolvedUUID)) {
    await updateUsername(resolvedUUID);
  }

  res.status(200).json({
    message: 'Login successful',
    user: {
      uuid: user.uuid,
      username: user.username,
      is_active: user.is_active,
      permissions: JSON.parse(user.permissions || '[]'),
    },
  });
  
});

// --- Logout ---
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// --- Update user ---
router.put('/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const { username, permissions, password, is_active = 1, editorUUID } = req.body;

  const user = await getUserByUUID(uuid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    await db.query(
      'UPDATE users SET username = ?, permissions = ?, is_active = ? WHERE uuid = ?',
      [username, JSON.stringify(permissions), is_active, uuid]
    );

    if (password?.trim()) {
      const hashed = await bcrypt.hash(password.trim(), 10);
      await db.query('UPDATE users SET password_hash = ? WHERE uuid = ?', [hashed, uuid]);
    }

    await logActivity({
      type: 'User',
      target_id: username,
      user: editorUUID,
      action: 'Edited',
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.use(requireAuth);

// --- Permissions ---
router.get('/permissions/:uuid', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT permissions FROM users WHERE uuid = ?', [req.params.uuid]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    let permissions;
    try {
      permissions = JSON.parse(rows[0].permissions);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse permissions' });
    }

    res.json({ permissions });
  } catch (err) {
    console.error('Error in GET /permissions/:uuid', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Reactivate user ---
router.post('/:uuid/reactivate', async (req, res) => {
  const { uuid } = req.params;
  const { username } = req.body;

  const user = await getUserByUUID(uuid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    await db.query('UPDATE users SET is_active = 1 WHERE uuid = ?', [uuid]);

    await logActivity({
      type: 'User',
      target_id: uuid,
      user: username ?? null,
      action: 'Reactivated',
    });

    res.status(200).json({ message: 'User reactivated' });
  } catch (err) {
    console.error('Failed to reactivate user:', err);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

// --- Get logged-in user ---
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user: req.session.user });
});

// --- Get all users ---
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT uuid, username, is_active FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- Get user by UUID ---
router.get('/:uuid', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT uuid, username, permissions, is_active FROM users WHERE uuid = ?', [req.params.uuid]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    user.permissions = JSON.parse(user.permissions || '[]');

    res.json(user);
  } catch (err) {
    console.error('Error in GET /:uuid', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Make sure this route returns proper { username } format
router.get('/:uuid/username', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT username FROM users WHERE uuid = ? LIMIT 1', 
      [req.params.uuid]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ username: rows[0].username }); // Ensure proper format
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Delete user ---
router.delete('/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const { editor_uuid } = req.body;

  try {
    const [result] = await db.query('DELETE FROM users WHERE uuid = ?', [uuid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logActivity({
      type: 'User',
      target_id: uuid,
      user: editor_uuid,
      action: 'Deleted',
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
