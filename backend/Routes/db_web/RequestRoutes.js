// Routes/PageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../../webmeta');
const logActivity = require("../../utils/LogActivity");

// 1. Get all page_data entries
router.get('/', async (req, res) => {
  try {
    const [entries] = await db.query(`
      SELECT 
        r.ind, 
        r.request_type, 
        r.type, 
        r.id, 
        r.description, 
        r.request_time, 
        r.action, 
        r.action_time,
        requester_user.username AS requester_username,
        acceptor_user.username AS acceptor_username
      FROM requests r
      LEFT JOIN users requester_user ON r.requester = requester_user.uuid
      LEFT JOIN users acceptor_user ON r.acceptor = acceptor_user.uuid
    `);
    
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT 
            r.ind, 
            r.request_type, 
            r.type, 
            r.id, 
            r.description, 
            r.request_time, 
            r.action, 
            r.action_time,
            requester_user.username AS requester_username,
            acceptor_user.username AS acceptor_username
        FROM requests r
        LEFT JOIN users requester_user ON r.requester = requester_user.uuid
        LEFT JOIN users acceptor_user ON r.acceptor = acceptor_user.uuid
        WHERE r.action = 'PENDING'
        `);

        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', async (req, res) => {
  const { uuid } = req.query;

  if (!uuid) {
    return res.status(400).json({ error: 'UUID parameter is required' });
  }

  try {
    const [entries] = await db.query(`
      SELECT
        r.ind,
        r.request_type,
        r.type,
        r.id,
        r.description,
        r.request_time,
        r.action,
        r.action_time,
        requester_user.username AS requester_username,
        acceptor_user.username AS acceptor_username
      FROM requests r
             LEFT JOIN users requester_user ON r.requester = requester_user.uuid
             LEFT JOIN users acceptor_user ON r.acceptor = acceptor_user.uuid
      WHERE requester = ?
    `, [uuid]);

    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a page
router.post('/', async (req, res) => {
  const { request_type, type, id, uuid, description} = req.body;

  try {
    await db.query(`
      INSERT INTO requests (request_type, type, id, requester, description, action)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [request_type, type, id, uuid, description, 'PENDING']);

    res.status(201).json({ message: 'Request submitted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Touch update
router.patch('/:ind', async (req, res) => {
  const { ind } = req.params;
  const { request_type, action, username, uuid } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE requests
      SET action = ?, action_time = CURRENT_TIMESTAMP, acceptor = ?
      WHERE ind = ?
    `, [action, uuid, ind]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await logActivity({
      type: `${request_type === "UNLOCK" ? 'Unlock' : 'Delete'} Request`,
      target_id: username,
      user: uuid,
      action: `${action === 'APPROVED' ? 'Approved' : 'Denied'}`
    });

    res.status(200).json({ message: 'Last edited timestamp updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
