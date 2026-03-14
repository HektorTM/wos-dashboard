const express = require('express');
const router = express.Router();
const db = require('../../db');
const logActivity = require('../../utils/LogActivity');

// ─── GUIs ────────────────────────────────────────────────────────────────────

// GET /api/guis
router.get('/', async (req, res) => {
  try {
    const [guis] = await db.query('SELECT * FROM guis');
    res.status(200).json(guis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guis
router.post('/', async (req, res) => {
  const { id, title, size, type } = req.body;
  const { uuid } = req.query;

  if (!id || !title || !size || !type) {
    return res.status(400).json({ error: 'id, title, size, and type are required' });
  }
  if (type !== 'fluid' && type !== 'static') {
    return res.status(400).json({ error: 'type must be "fluid" or "static"' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM guis WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'GUI with this ID already exists' });
    }

    await db.query(
      'INSERT INTO guis (id, title, size, type) VALUES (?, ?, ?, ?)',
      [id, title, size, type]
    );

    const [rows] = await db.query('SELECT * FROM guis WHERE id = ?', [id]);
    res.status(201).json(rows[0]);

    logActivity({ type: 'GUI', target_id: id, user: uuid, action: 'Created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guis/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [guiRows] = await db.query('SELECT * FROM guis WHERE id = ?', [id]);
    if (guiRows.length === 0) {
      return res.status(404).json({ error: 'GUI not found' });
    }

    const [pages] = await db.query(
      'SELECT * FROM gui_pages WHERE gui_id = ? ORDER BY page_id ASC',
      [id]
    );

    const [slots] = await db.query(
      'SELECT * FROM gui_slots WHERE gui_id = ? ORDER BY page_id ASC, slot_id ASC',
      [id]
    );

    const [configs] = await db.query(
      'SELECT * FROM gui_slot_configs WHERE gui_id = ? ORDER BY page_id ASC, slot_id ASC, config_id ASC',
      [id]
    );

    res.json({ gui: guiRows[0], pages, slots, configs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/guis/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { size, title, type, open_actions, close_actions, uuid } = req.body;

  if (!size || !title || !type) {
    return res.status(400).json({ error: 'size, title, and type are required' });
  }
  if (type !== 'fluid' && type !== 'static') {
    return res.status(400).json({ error: 'type must be "fluid" or "static"' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM guis WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'GUI not found' });
    }

    const [result] = await db.query(
      'UPDATE guis SET size = ?, title = ?, type = ?, open_actions = ?, close_actions = ? WHERE id = ?',
      [size, title, type, JSON.stringify(open_actions), JSON.stringify(close_actions), id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No changes made' });
    }

    res.status(200).json({ message: 'GUI updated successfully' });
    logActivity({ type: 'GUI', target_id: id, user: uuid, action: 'Edited' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/guis/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { uuid } = req.query;

  try {
    await db.query('DELETE FROM gui_slot_configs WHERE gui_id = ?', [id]);
    await db.query('DELETE FROM conditions WHERE type = "guislot" AND type_id LIKE ?', [`${id}:%`]);
    await db.query('DELETE FROM gui_slots WHERE gui_id = ?', [id]);
    await db.query('DELETE FROM gui_pages WHERE gui_id = ?', [id]);
    const [result] = await db.query('DELETE FROM guis WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'GUI not found' });
    }

    res.status(200).json({ ok: true });
    logActivity({ type: 'GUI', target_id: id, user: uuid, action: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Pages ───────────────────────────────────────────────────────────────────

// GET /api/guis/:id/pages
router.get('/:id/pages', async (req, res) => {
  const { id } = req.params;
  try {
    const [pages] = await db.query(
      'SELECT * FROM gui_pages WHERE gui_id = ? ORDER BY page_id ASC',
      [id]
    );
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guis/:id/pages
router.post('/:id/pages', async (req, res) => {
  const { id } = req.params;
  try {
    const [maxResult] = await db.query(
      'SELECT MAX(page_id) as maxId FROM gui_pages WHERE gui_id = ?',
      [id]
    );
    const nextPageId = (maxResult[0].maxId ?? -1) + 1;

    await db.query('INSERT INTO gui_pages (gui_id, page_id) VALUES (?, ?)', [id, nextPageId]);
    res.status(201).json({ page_id: nextPageId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/guis/:id/pages/:pageId
router.delete('/:id/pages/:pageId', async (req, res) => {
  const { id, pageId } = req.params;
  try {
    await db.query(
      'DELETE FROM gui_slot_configs WHERE gui_id = ? AND page_id = ?',
      [id, pageId]
    );
    await db.query(
      'DELETE FROM conditions WHERE type = "guislot" AND type_id LIKE ?',
      [`${id}:${pageId}:%`]
    );
    await db.query('DELETE FROM gui_slots WHERE gui_id = ? AND page_id = ?', [id, pageId]);
    const [result] = await db.query(
      'DELETE FROM gui_pages WHERE gui_id = ? AND page_id = ?',
      [id, pageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Slots ───────────────────────────────────────────────────────────────────

// GET /api/guis/:id/pages/:pageId/slots
router.get('/:id/pages/:pageId/slots', async (req, res) => {
  const { id, pageId } = req.params;
  try {
    const [slots] = await db.query(
      'SELECT * FROM gui_slots WHERE gui_id = ? AND page_id = ? ORDER BY slot_id ASC',
      [id, pageId]
    );
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guis/:id/pages/:pageId/slots
router.post('/:id/pages/:pageId/slots', async (req, res) => {
  const { id, pageId } = req.params;
  const { slot_id, active } = req.body;

  if (slot_id === undefined) {
    return res.status(400).json({ error: 'slot_id is required' });
  }

  try {
    await db.query(
      'INSERT INTO gui_slots (gui_id, page_id, slot_id, active) VALUES (?, ?, ?, ?)',
      [id, pageId, slot_id, active ? 1 : 0]
    );
    res.status(201).json({ slot_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/guis/:id/pages/:pageId/slots/:slotId
router.put('/:id/pages/:pageId/slots/:slotId', async (req, res) => {
  const { id, pageId, slotId } = req.params;
  const { active } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE gui_slots SET active = ? WHERE gui_id = ? AND page_id = ? AND slot_id = ?',
      [active ? 1 : 0, id, pageId, slotId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    res.status(200).json({ message: 'Slot updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/guis/:id/pages/:pageId/slots/:slotId
router.delete('/:id/pages/:pageId/slots/:slotId', async (req, res) => {
  const { id, pageId, slotId } = req.params;
  try {
    await db.query(
      'DELETE FROM gui_slot_configs WHERE gui_id = ? AND page_id = ? AND slot_id = ?',
      [id, pageId, slotId]
    );
    await db.query(
      'DELETE FROM conditions WHERE type = "guislot" AND type_id LIKE ?',
      [`${id}:${pageId}:${slotId}:%`]
    );
    await db.query(
      'DELETE FROM gui_slots WHERE gui_id = ? AND page_id = ? AND slot_id = ?',
      [id, pageId, slotId]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Slot Configs ─────────────────────────────────────────────────────────────

// GET /api/guis/:id/pages/:pageId/slots/:slotId/configs
router.get('/:id/pages/:pageId/slots/:slotId/configs', async (req, res) => {
  const { id, pageId, slotId } = req.params;
  try {
    const [configs] = await db.query(
      'SELECT * FROM gui_slot_configs WHERE gui_id = ? AND page_id = ? AND slot_id = ? ORDER BY config_id ASC',
      [id, pageId, slotId]
    );
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guis/:id/pages/:pageId/slots/:slotId/configs
router.post('/:id/pages/:pageId/slots/:slotId/configs', async (req, res) => {
  const { id, pageId, slotId } = req.params;
  const {
    matchtype,
    visible,
    material,
    display_name,
    lore,
    model,
    color,
    enchanted,
    global_actions,
    right_actions,
    left_actions,
  } = req.body;

  try {
    const [maxResult] = await db.query(
      'SELECT MAX(config_id) as maxId FROM gui_slot_configs WHERE gui_id = ? AND page_id = ? AND slot_id = ?',
      [id, pageId, slotId]
    );
    const nextConfigId = (maxResult[0].maxId ?? -1) + 1;

    await db.query(
      `INSERT INTO gui_slot_configs
        (gui_id, page_id, slot_id, config_id, matchtype, visible, material, display_name, lore, model, color, enchanted, global_actions, right_actions, left_actions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, pageId, slotId, nextConfigId,
        matchtype,
        visible ? 1 : 0,
        material,
        display_name,
        JSON.stringify(lore ?? []),
        model ?? null,
        color ?? null,
        enchanted ? 1 : 0,
        JSON.stringify(global_actions ?? []),
        JSON.stringify(right_actions ?? []),
        JSON.stringify(left_actions ?? []),
      ]
    );

    res.status(201).json({ config_id: nextConfigId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/guis/:id/pages/:pageId/slots/:slotId/configs/:configId
router.put('/:id/pages/:pageId/slots/:slotId/configs/:configId', async (req, res) => {
  const { id, pageId, slotId, configId } = req.params;
  const {
    matchtype,
    visible,
    material,
    display_name,
    lore,
    model,
    color,
    enchanted,
    global_actions,
    right_actions,
    left_actions,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE gui_slot_configs
       SET matchtype = ?, visible = ?, material = ?, display_name = ?, lore = ?, model = ?, color = ?, enchanted = ?, global_actions = ?, right_actions = ?, left_actions = ?
       WHERE gui_id = ? AND page_id = ? AND slot_id = ? AND config_id = ?`,
      [
        matchtype,
        visible ? 1 : 0,
        material,
        display_name,
        JSON.stringify(lore ?? []),
        model ?? null,
        color ?? null,
        enchanted ? 1 : 0,
        JSON.stringify(global_actions ?? []),
        JSON.stringify(right_actions ?? []),
        JSON.stringify(left_actions ?? []),
        id, pageId, slotId, configId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.status(200).json({ message: 'Slot config updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/guis/:id/pages/:pageId/slots/:slotId/configs/:configId
router.delete('/:id/pages/:pageId/slots/:slotId/configs/:configId', async (req, res) => {
  const { id, pageId, slotId, configId } = req.params;
  try {
    await db.query(
      'DELETE FROM conditions WHERE type = "guislot" AND type_id = ?',
      [`${id}:${pageId}:${slotId}:${configId}`]
    );
    const [result] = await db.query(
      'DELETE FROM gui_slot_configs WHERE gui_id = ? AND page_id = ? AND slot_id = ? AND config_id = ?',
      [id, pageId, slotId, configId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;