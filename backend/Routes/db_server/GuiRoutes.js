const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL connection
const logActivity = require('../../utils/LogActivity');

// Get all GUIs
router.get('/', async (req, res) => {
  try {
    const [guis] = await db.query('SELECT * FROM guis');
    res.status(200).json(guis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get GUI by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [guiRows] = await db.query('SELECT * FROM guis WHERE id = ?', [id]);
    if (guiRows.length === 0) {
      return res.status(404).json({ error: 'GUI not found' });
    }
    const [gui] = await db.query('SELECT * FROM guis WHERE id = ?', [id]);
    const [slots] = await db.query('SELECT * FROM gui_slots WHERE gui_id = ? ORDER BY slot ASC', [id]);

    res.json({
      gui,
      slots,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { size, title, open_actions, close_actions } = req.body;
    const { uuid } = req.body;

    if (!size || !title) {
        return res.status(400).json({ error: 'Size and Title are required.' });
    }

    try {
        // Check if cosmetic exists
        const [existingRows] = await db.query('SELECT * FROM guis WHERE id = ?', [id]);
        if (!existingRows[0]) {
            return res.status(404).json({ error: 'GUI not found' });
        }

        // Update the cosmetic
        const [result] = await db.query(`
            UPDATE guis
            SET size = ?, title = ?, open_actions = ?, close_actions = ?
            WHERE id = ?
        `, [size, title, open_actions, close_actions, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No changes were made to the GUI.' });
        }

        res.status(200).json({ message: 'GUI updated successfully' });
        await logActivity({
            type: 'GUI',
            target_id: id,
            user: uuid,
            action: 'Edited',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get only slots for GUI
router.get('/:id/slots', async (req, res) => {
  const { id } = req.params;
  try {
    const [slots] = await db.query('SELECT slot FROM gui_slots WHERE gui_id = ? ORDER BY slot ASC', [id]);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single slot options for GUI
router.get('/:id/slots/:slot', async (req, res) => {
  const { id, slot } = req.params;
  try {
    const [slots] = await db.query(
      'SELECT * FROM gui_slots WHERE gui_id = ? AND slot = ?', 
      [id, slot]
    );
    
    if (slots.length === 0) {
      return res.json(null);
    }
    
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get Single ID from Slot
router.get('/:id/slots/:slot/:slotId', async (req, res) => {
  const { id, slot, slotId } = req.params;
  try {
    const [slots] = await db.query(
      'SELECT * FROM gui_slots WHERE gui_id = ? AND slot = ? AND slot_id = ?', 
      [id, slot, slotId]
    );
    
    if (slots.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    res.json(slots[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
    const { id, uuid } = req.body;
  
    if (!id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await db.query('INSERT INTO guis (id) VALUES (?)', [id]);
  
      res.status(201).json({ message: 'GUI created successfully' });
  
      logActivity({
        type: 'GUI',
        target_id: id,
        user: uuid,
        action: 'Created',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.post('/:id/slots/:slotNumber', async (req, res) => {
  const { id, slotNumber } = req.params;
  const { 
    matchtype,
    material,
    display_name, 
    lore, 
    custom_model_data,
    enchanted,
    right_click,
    left_click,
    visible,
  } = req.body;

  

  try {
    // Get the next available action_id
    const [maxIdResult] = await db.query(
      'SELECT MAX(slot_id) as maxId FROM gui_slots WHERE gui_id = ? AND slot = ?',
      [id, slotNumber]
    );
    const nextSlotId = (maxIdResult[0].maxId || 0) + 1;
    console.info(id, slotNumber, nextSlotId, matchtype, material, display_name, lore, custom_model_data, enchanted, right_click, left_click, visible);
    // Insert the new action
    await db.query(
      'INSERT INTO gui_slots (gui_id, slot, slot_id, matchtype, material, display_name, lore, custom_model_data, enchanted, right_click, left_click, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, 
        slotNumber, 
        nextSlotId, 
        matchtype, 
        material, 
        display_name, 
        JSON.stringify(lore),
        custom_model_data, 
        enchanted ? 1 : 0, 
        JSON.stringify(right_click), 
        JSON.stringify(left_click), 
        visible ? 1 : 0
      ]
    );

    res.status(201).json({
      message: 'Slot Item created successfully',
      slot_id: nextSlotId,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/slots/:slotNumber/:slotId', async (req, res) => {
  const { id, slotNumber, slotId } = req.params;
  const { 
    matchtype,
    material,
    display_name, 
    lore, 
    custom_model_data,
    enchanted,
    right_click,
    left_click,
    visible,
  } = req.body;

  try {
    await db.query(
      'UPDATE gui_slots SET matchtype = ?, material = ?, display_name = ?, lore = ?, custom_model_data = ?, enchanted = ?, right_click = ?, left_click = ?, visible = ? WHERE gui_id = ? AND slot = ? AND slot_id = ?',
      [
        matchtype, 
        material, 
        display_name, 
        JSON.stringify(lore),
        custom_model_data, 
        enchanted ? 1 : 0, 
        JSON.stringify(right_click), 
        JSON.stringify(left_click), 
        visible ? 1 : 0,
        id,
        slotNumber,
        slotId
      ]
    );

    res.status(201).json({
      message: 'Slot Item updated successfully',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/slots/:slotNumber/:slotID', async (req, res) => {
  const {id, slotNumber, slotID} = req.params;

    try {
      await db.query('DELETE FROM gui_slots WHERE gui_id = ? AND slot = ? AND slot_id = ?', [id, slotNumber, slotID]);
      res.status(200).json({ message: 'Slot deleted successfully'});

    } catch (err) {
      res.status(500).json({ error: err.message });
      console.error(err);
    }
});

module.exports = router;