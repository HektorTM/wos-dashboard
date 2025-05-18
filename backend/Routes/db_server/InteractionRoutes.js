const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL connection
const logActivity = require('../../utils/LogActivity');

// ✅ Get all interactions
router.get('/', async (req, res) => {
  try {
    const [interactions] = await db.query('SELECT * FROM interactions');
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get interaction by ID (with actions + holograms + blocks + npcs)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [interactionRows] = await db.query('SELECT * FROM interactions WHERE id = ?', [id]);
    if (interactionRows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    const [actions] = await db.query('SELECT * FROM inter_actions WHERE id = ? ORDER BY action_id ASC', [id]);
    const [particles] = await db.query('SELECT * FROM inter_particles WHERE id = ?', [id]);
    const [holograms] = await db.query('SELECT * FROM inter_holograms WHERE interaction_id = ?', [id]);
    const [blocks] = await db.query('SELECT location FROM inter_blocks WHERE interaction_id = ?', [id]);
    const [npcs] = await db.query('SELECT npc_id FROM inter_npcs WHERE interaction_id = ?', [id]);

    res.json({
      id,
      actions,
      particles,
      holograms,
      blocks,
      npcs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only actions for interaction
router.get('/:id/actions', async (req, res) => {
  const { id } = req.params;
  try {
    const [actions] = await db.query('SELECT * FROM inter_actions WHERE id = ? ORDER BY action_id ASC', [id]);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only holograms for interaction
router.get('/:id/holograms', async (req, res) => {
  const { id } = req.params;
  try {
    const [holograms] = await db.query('SELECT * FROM inter_holograms WHERE interaction_id = ?', [id]);
    res.json(holograms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only NPCs for interaction
router.get('/:id/npcs', async (req, res) => {
  const { id } = req.params;
  try {
    const [npcs] = await db.query('SELECT npc_id FROM inter_npcs WHERE interaction_id = ?', [id]);
    res.json(npcs.map(row => row.npc_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only blocks for interaction
router.get('/:id/blocks', async (req, res) => {
  const { id } = req.params;
  try {
    const [blocks] = await db.query('SELECT location FROM inter_blocks WHERE interaction_id = ?', [id]);
    res.json(blocks.map(row => row.location));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get single action for interaction
router.get('/:id/actions/:actionId', async (req, res) => {
  const { id, actionId } = req.params;
  try {
    const [actions] = await db.query(
      'SELECT * FROM inter_actions WHERE id = ? AND action_id = ?', 
      [id, actionId]
    );
    
    if (actions.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }
    
    res.json(actions[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interactions/:id/actions
router.post('/:id/actions', async (req, res) => {
  const { id } = req.params;
  const { behaviour, matchtype, actions } = req.body;

  try {
    // Get the next available action_id
    const [maxIdResult] = await db.query(
      'SELECT MAX(action_id) as maxId FROM inter_actions WHERE id = ?',
      [id]
    );
    const nextActionId = (maxIdResult[0].maxId || 0) + 1;

    // Insert the new action
    await db.query(
      'INSERT INTO inter_actions (id, action_id, behaviour, matchtype, actions) VALUES (?, ?, ?, ?, ?)',
      [id, nextActionId, behaviour, matchtype, JSON.stringify(actions)]
    );

    res.status(201).json({
      message: 'Action created successfully',
      action_id: nextActionId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/interactions/:id/actions/:actionId
router.put('/:id/actions/:actionId', async (req, res) => {
  const { id, actionId } = req.params;
  const { behaviour, matchtype, actions } = req.body;

  try {
    // First check if the action exists
    const [existing] = await db.query(
      'SELECT * FROM inter_actions WHERE id = ? AND action_id = ?',
      [id, actionId]
    );

    if (existing.length === 0) {
      // If not exists, create it
      await db.query(
        'INSERT INTO inter_actions (id, action_id, behaviour, matchtype, actions) VALUES (?, ?, ?, ?, ?)',
        [id, actionId, behaviour, matchtype, JSON.stringify(actions)]
      );
      return res.status(201).json({ message: 'Action created successfully' });
    }

    // If exists, update it
    const [result] = await db.query(
      'UPDATE inter_actions SET behaviour = ?, matchtype = ?, actions = ? WHERE id = ? AND action_id = ?',
      [behaviour, matchtype, JSON.stringify(actions), id, actionId]
    );
    
    res.json({ message: 'Action updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  
// PUT /api/interactions/:id/holograms/:hologramId
router.put('/:id/holograms/:hologramId', async (req, res) => {
    const { id, hologramId } = req.params;
    const { behaviour, matchtype, hologram } = req.body;
  
    try {
      const [result] = await db.query(
        'UPDATE inter_holograms SET behaviour = ?, matchtype = ?, hologram = ? WHERE interaction_id = ? AND hologram_id = ?',
        [behaviour, matchtype, JSON.stringify(hologram), id, hologramId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Hologram not found' });
      }
      res.json({ message: 'Hologram updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

  // PARTICLES

// ✅ Get single particle for interaction
router.get('/:id/particles/:particleId', async (req, res) => {
  const { id, particleId } = req.params;
  try {
    const [actions] = await db.query(
      'SELECT * FROM inter_particles WHERE id = ? AND particle_id = ?', 
      [id, particleId]
    );
    
    if (actions.length === 0) {
      return res.status(404).json({ error: 'Particle not found' });
    }
    
    res.json(actions[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/particles', async (req, res) => {
  const { id } = req.params;
  const { behaviour, matchtype, particle, particle_color } = req.body;

  try {
    const [maxIdResult] = await db.query(
      'SELECT MAX(particle_id) as maxId FROM inter_particles WHERE id = ?',
      [id]
    );
    const nextParticleId = (maxIdResult[0].maxId || 0) + 1;

    await db.query(
      'INSERT INTO inter_particles (id, particle_id, behaviour, matchtype, particle, particle_color) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nextParticleId, behaviour, matchtype, particle, particle_color]
    );

    res.status(201).json({
      message: 'Particle created successfully',
      particle_id: nextParticleId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
});

// PUT /api/interactions/:id/actions/:actionId
router.put('/:id/particles/:particleId', async (req, res) => {
  const { id, particleId } = req.params;
  const { behaviour, matchtype, particle, particle_color } = req.body;

  try {
    // First check if the action exists
    const [existing] = await db.query(
      'SELECT * FROM inter_particles WHERE id = ? AND particle_id = ?',
      [id, particleId]
    );

    if (existing.length === 0) {
      // If not exists, create it
      await db.query(
        'INSERT INTO inter_particles (id, particle_id, behaviour, matchtype, particle, particle_color) VALUES (?, ?, ?, ?, ?, ?)',
        [id, particleId, behaviour, matchtype, particle, particle_color]
      );
      return res.status(201).json({ message: 'Particle created successfully' });
    }

    // If exists, update it
    const [result] = await db.query(
      'UPDATE inter_particles SET behaviour = ?, matchtype = ?, particle = ?, particle_color = ? WHERE id = ? AND particle_id = ?',
      [behaviour, matchtype, particle, particle_color, id, particleId]
    );
    
    res.json({ message: 'Particle updated successfully' });
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
      await db.query('INSERT INTO interactions (id) VALUES (?)', [id]);
  
      res.status(201).json({ message: 'Interaction created successfully' });
  
      logActivity({
        type: 'Interaction',
        target_id: id,
        user: uuid,
        action: 'Created',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.delete('/:id/actions/:itemId', async (req, res) => {
    const {id, itemId} = req.params;

    try {
      await db.query('DELETE FROM inter_actions WHERE id = ? AND action_id = ?', [id, itemId]);
      res.status(200).json({ message: 'Action deleted successfully'});

    } catch (err) {
      res.status(500).json({ error: err.message });
      console.error(err);
    }
});

router.delete('/:id/particles/:itemId', async (req, res) => {
    const {id, itemId} = req.params;

    try {
      await db.query('DELETE FROM inter_particles WHERE id = ? AND particle_id = ?', [id, itemId]);
      res.status(200).json({ message: 'Particle deleted successfully'});

    } catch (err) {
      res.status(500).json({ error: err.message });
      console.error(err);
    }
});

module.exports = router;
