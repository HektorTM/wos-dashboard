{/*AdminRoutes.js*/}
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Make sure this uses better-sqlite3 and exports the db instance

const router = express.Router();

// Helper to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// 1. Create User (POST /api/admin/users)
router.post('/users', async (req, res) => {
  const { username, password, permissions } = req.body;

  if (!username || !password || !permissions) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const hashedPassword = await hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (username, password, permissions) VALUES (?, ?, ?)');
    const info = stmt.run(username, hashedPassword, JSON.stringify(permissions));
    res.status(201).json({ id: info.lastInsertRowid, username, permissions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

// 2. Get All Users (GET /api/admin/users)
router.get('/users', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, username, permissions FROM users');
    const users = stmt.all();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching users');
  }
});

// 3. Get Single User (GET /api/admin/users/:id)
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT id, username, permissions FROM users WHERE id = ?');
    const user = stmt.get(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching user');
  }
});

// 4. Update User (PUT /api/admin/users/:id)
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, permissions } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).send('User not found');

    const updatedPassword = password ? await hashPassword(password) : user.password;
    const stmt = db.prepare('UPDATE users SET username = ?, password = ?, permissions = ? WHERE id = ?');
    const info = stmt.run(username, updatedPassword, JSON.stringify(permissions), id);

    res.json({ id, username, permissions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating user');
  }
});

// 5. Delete User (DELETE /api/admin/users/:id)
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      return res.status(404).send('User not found or already deleted');
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting user');
  }
});

module.exports = router;
