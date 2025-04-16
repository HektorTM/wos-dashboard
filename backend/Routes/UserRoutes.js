const express = require('express');
const router = express.Router();
const db = require('../webmeta.js');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const logActivity = require('../utils/LogActivity');
const requireAuth = require('../middleware/auth');

// Fetch current username from Mojang API
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
function getUserByUUID(uuid) {
  return db.prepare('SELECT * FROM users WHERE uuid = ?').get(uuid);
}

function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

// --- Register ---
router.post('/register', async (req, res) => {
    const { uuid, password, editorUUID } = req.body;
  
    if (!uuid || !password) {
      return res.status(400).json({ error: 'UUID and password are required' });
    }
  
    const existing = getUserByUUID(uuid);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
  
    const username = await fetchUsername(uuid);
    if (!username) {
      return res.status(404).json({ error: 'Invalid Minecraft UUID' });
    }
  
    const hashed = await bcrypt.hash(password, 10);
  
    try {
      db.prepare(`
        INSERT INTO users (uuid, username, password_hash)
        VALUES (?, ?, ?)
      `).run(uuid, username, hashed);
  
      
  
      logActivity({
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
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    const user = getUserByUsername(username);
    if (!user) return res.status(404).json({ error: 'User not found' });
  
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact admin.' });
    }
  
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
  
    req.session.user = {
      uuid: user.uuid,
      username: user.username
    };
  
    db.prepare(`UPDATE users SET last_login = ? WHERE uuid = ?`).run(new Date().toISOString(), user.uuid);
  
    res.status(200).json({
      message: 'Login successful',
      user: {
        uuid: user.uuid,
        username: user.username,
        is_active: user.is_active,
      },
    });
  });
  

    router.post('/logout', (req, res) => {
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // default cookie name
            res.json({ message: 'Logged out' });
        });
    });

    router.put('/:uuid', async (req, res) => {
        const { uuid } = req.params;
        const { username, permissions, password, is_active = 1, editorUUID } = req.body;
      
        const user = getUserByUUID(uuid);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
      
        try {
          db.prepare(`
            UPDATE users
            SET username = ?, permissions = ?, is_active = ?
            WHERE uuid = ?
          `).run(username, JSON.stringify(permissions), is_active, uuid);
      
          if (password && password.trim().length > 0) {
            const hashed = await bcrypt.hash(password.trim(), 10);
            db.prepare(`
              UPDATE users
              SET password_hash = ?
              WHERE uuid = ?
            `).run(hashed, uuid);
          }
      
          
      
          logActivity({
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

// --- User Permissions ---
router.get('/permissions/:uuid', (req, res) => {
    try {
        const user = db.prepare('SELECT permissions FROM users WHERE uuid = ?').get(req.params.uuid);
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Parse the permissions if they are stored as a JSON string
        let permissions;
        try {
            permissions = JSON.parse(user.permissions);  // Ensure permissions are an array
        } catch (err) {
            return res.status(500).json({ error: 'Failed to parse permissions' });
        }

        res.json({ permissions });  // Send the permissions as an array
    } catch (err) {
        console.error('Error in GET /permissions/:uuid', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- Update user ---


// --- Reactivate user ---
router.post('/:uuid/reactivate', (req, res) => {
  const { uuid, username } = req.params;

  const user = getUserByUUID(uuid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    db.prepare('UPDATE users SET is_active = 1 WHERE uuid = ?').run(uuid);
    

    logActivity({
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



router.get('/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  
    res.json({ user: req.session.user });
  });

  

// --- Get all users ---
router.get('/', (req, res) => {
  try {
    const users = db.prepare('SELECT uuid, username, is_active FROM users').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- Get user by UUID ---
router.get('/:uuid', (req, res) => {
  try {
    const user = db.prepare('SELECT uuid, username, permissions, is_active FROM users WHERE uuid = ?').get(req.params.uuid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user) {
        user.permissions = JSON.parse(user.permissions); // Ensure it's an array
      }
    res.json(user);
  } catch (err) {
    console.error('Error in GET /:uuid', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:uuid', (req, res) => {
    const {uuid, username} = req.params;
    const { editor_uuid } = req.body;
  
    try {
      const result = db.prepare('DELETE FROM users WHERE uuid = ?').run(uuid);
  
      if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
      logActivity({
        type: 'User',
        target_id: username,
        user: editor_uuid,
        action: 'Deleted',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


module.exports = router;
