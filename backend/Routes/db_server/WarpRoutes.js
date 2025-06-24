const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL db connection (pool or promise-based)
const logActivity = require('../../utils/LogActivity');

// 1. Get all warps
router.get('/', async (req, res) => {
  try {
    const [warps] = await db.query('SELECT * FROM warps');
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete warp
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    const [result] = await db.query('DELETE FROM warps WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Warp not found' });
    }

    res.status(200).json({ message: 'Warp deleted successfully' });

    try {
      logActivity({
        type: 'Warp',
        target_id: id,
        user: uuid,
        action: 'Deleted',
      });
    } catch (logErr) {
      console.error('Logging failed:', logErr);
    }
  } catch (err) {
    console.error('DELETE warp error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
