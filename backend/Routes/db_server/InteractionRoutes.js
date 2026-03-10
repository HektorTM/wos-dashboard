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

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const [[interaction]] = await db.query(
        "SELECT id FROM interactions WHERE id = ?",
        [id]
    )
    if (!interaction) {
      return res.status(404).json({ error: "Interaction not found" })
    }

    const [actionRows] = await db.query(
        "SELECT * FROM inter_actions WHERE id = ? ORDER BY action_id ASC",
        [id]
    )

    const [conditionRows] = await db.query(
        "SELECT * FROM conditions WHERE type = ? AND type_id LIKE ?",
        ["interaction", `${id}:%`]
    )

    // Build condition map
    const conditionsBySubId = {}
    for (const row of conditionRows) {
      const [, subId] = row.type_id.split(":")
      const key = Number(subId)

      if (!conditionsBySubId[key]) {
        conditionsBySubId[key] = []
      }

      conditionsBySubId[key].push({
        type: row.type,
        type_id: row.type_id,
        condition_id: row.condition_id,
        condition_key: row.condition_key,
        value: row.value,
        parameter: row.parameter,
      })
    }

    const actions = actionRows.map(row => ({
      action_id: row.action_id,
      behaviour: row.behaviour,
      matchtype: row.matchtype,
      actions: JSON.parse(row.actions),
      conditions: conditionsBySubId[row.action_id] ?? [],
    }))

    const [particleRows] = await db.query(
        "SELECT * FROM inter_particles WHERE id = ? ORDER BY particle_id ASC",
        [id]
    )

    const [particleConditionRows] = await db.query(
        "SELECT * FROM conditions WHERE type = ? AND type_id LIKE ?",
        ["particle", `${id}:%`]
    )

    const particleConditionsBySubId = {}
    for (const row of particleConditionRows) {
      const [, subId] = row.type_id.split(":")
      const key = Number(subId)

      if (!particleConditionsBySubId[key]) {
        particleConditionsBySubId[key] = []
      }

      particleConditionsBySubId[key].push({
        type: row.type,
        type_id: row.type_id,
        condition_id: row.condition_id,
        condition_key: row.condition_key,
        value: row.value,
        parameter: row.parameter,
      })
    }

    const particles = particleRows.map(row => ({
      particle_id: row.particle_id,
      behaviour: row.behaviour,
      matchtype: row.matchtype,
      particle: row.particle,
      particle_color: row.particle_color,
      conditions: particleConditionsBySubId[row.particle_id] ?? [],
    }))

    //---


    const [hologramRows] = await db.query(
        "SELECT * FROM inter_holograms WHERE interaction_id = ? ORDER BY hologram_id ASC",
        [id]
    )

    const [hologramConditionRows] = await db.query(
        "SELECT * FROM conditions WHERE type = ? AND type_id LIKE ?",
        ["hologram", `${id}:%`]
    )

    const hologramConditionsBySubId = {}
    for (const row of hologramConditionRows) {
      const [, subId] = row.type_id.split(":")
      const key = Number(subId)

      if (!hologramConditionsBySubId[key]) {
        hologramConditionsBySubId[key] = []
      }

      hologramConditionsBySubId[key].push({
        type: row.type,
        type_id: row.type_id,
        condition_id: row.condition_id,
        condition_key: row.condition_key,
        value: row.value,
        parameter: row.parameter,
      })
    }

    const holograms = hologramRows.map(row => ({
      hologram_id: row.hologram_id,
      behaviour: row.behaviour,
      matchtype: row.matchtype,
      hologram: row.hologram,
      conditions: hologramConditionsBySubId[row.hologram_id] ?? [],
    }))

    res.json({
      id,
      actions,
      particles,
      holograms,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch interaction" })
  }
})

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

router.put('/:id/actions/:actionId/move', async (req, res) => {
  const { id, actionId } = req.params; // 'id' is "interaction1"
  const { direction } = req.query;

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid direction' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verify current action exists using the readable 'id'
    const [currentRows] = await conn.query(
        'SELECT action_id FROM inter_actions WHERE id = ? AND action_id = ?',
        [id, actionId]
    );

    if (currentRows.length === 0) {
      throw new Error('Action not found');
    }

    // 2. Find the neighbor based on action_id order
    const operator = direction === 'up' ? '<' : '>';
    const order = direction === 'up' ? 'DESC' : 'ASC';

    const [neighbors] = await conn.query(
        `SELECT action_id FROM inter_actions
         WHERE id = ? AND action_id ${operator} ?
         ORDER BY action_id ${order} LIMIT 1`,
        [id, actionId]
    );

    if (neighbors.length === 0) {
      throw new Error(`Cannot move ${direction}: already at the edge.`);
    }

    const neighborId = neighbors[0].action_id;
    const tempId = -999; // Use a value unlikely to exist in action_id

    // 3. Swap the action_ids in inter_actions
    // Current -> Temp
    await conn.query(
        'UPDATE inter_actions SET action_id = ? WHERE id = ? AND action_id = ?',
        [tempId, id, actionId]
    );
    // Neighbor -> Current's old spot
    await conn.query(
        'UPDATE inter_actions SET action_id = ? WHERE id = ? AND action_id = ?',
        [actionId, id, neighborId]
    );
    // Temp -> Neighbor's old spot
    await conn.query(
        'UPDATE inter_actions SET action_id = ? WHERE id = ? AND action_id = ?',
        [neighborId, id, tempId]
    );

    // 4. Update the conditions table
    // Note: We use the readable 'id' here because your
    // frontend sends parentId={`${interactionId}:${action.action_id}`}
    const updateCond = async (oldIdx, newIdx) => {
      const oldTypeId = `${id}:${oldIdx}`;
      const newTypeId = `${id}:${newIdx}`;
      await conn.query(
          "UPDATE conditions SET type_id = ? WHERE type = 'interaction' AND type_id = ?",
          [newTypeId, oldTypeId]
      );
    };

    // Swap condition references using a temp string to avoid collisions
    await updateCond(actionId, "TEMP_MOVE");
    await updateCond(neighborId, actionId);
    await updateCond("TEMP_MOVE", neighborId);

    await conn.commit();
    res.json({ message: 'Action moved successfully' });

  } catch (err) {
    await conn.rollback();
    console.error("Move Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});
router.put('/:id/particles/:particleId/move', async (req, res) => {
  const { id, particleId } = req.params; // 'id' is "interaction1"
  const { direction } = req.query;

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid direction' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verify current action exists using the readable 'id'
    const [currentRows] = await conn.query(
        'SELECT particle_id FROM inter_particles WHERE id = ? AND particle_id = ?',
        [id, particleId]
    );

    if (currentRows.length === 0) {
      throw new Error('Action not found');
    }

    // 2. Find the neighbor based on particle_id order
    const operator = direction === 'up' ? '<' : '>';
    const order = direction === 'up' ? 'DESC' : 'ASC';

    const [neighbors] = await conn.query(
        `SELECT particle_id FROM inter_particles
         WHERE id = ? AND particle_id ${operator} ?
         ORDER BY particle_id ${order} LIMIT 1`,
        [id, particleId]
    );

    if (neighbors.length === 0) {
      throw new Error(`Cannot move ${direction}: already at the edge.`);
    }

    const neighborId = neighbors[0].particle_id;
    const tempId = -999; // Use a value unlikely to exist in particle_id

    // 3. Swap the particle_ids in inter_actions
    // Current -> Temp
    await conn.query(
        'UPDATE inter_particles SET particle_id = ? WHERE id = ? AND particle_id = ?',
        [tempId, id, particleId]
    );
    // Neighbor -> Current's old spot
    await conn.query(
        'UPDATE inter_particles SET particle_id = ? WHERE id = ? AND particle_id = ?',
        [particleId, id, neighborId]
    );
    // Temp -> Neighbor's old spot
    await conn.query(
        'UPDATE inter_particles SET particle_id = ? WHERE id = ? AND particle_id = ?',
        [neighborId, id, tempId]
    );

    // 4. Update the conditions table
    // Note: We use the readable 'id' here because your
    // frontend sends parentId={`${interparticleId}:${action.particle_id}`}
    const updateCond = async (oldIdx, newIdx) => {
      const oldTypeId = `${id}:${oldIdx}`;
      const newTypeId = `${id}:${newIdx}`;
      await conn.query(
          "UPDATE conditions SET type_id = ? WHERE type = 'particle' AND type_id = ?",
          [newTypeId, oldTypeId]
      );
    };

    // Swap condition references using a temp string to avoid collisions
    await updateCond(particleId, "TEMP_MOVE");
    await updateCond(neighborId, particleId);
    await updateCond("TEMP_MOVE", neighborId);

    await conn.commit();
    res.json({ message: 'Action moved successfully' });

  } catch (err) {
    await conn.rollback();
    console.error("Move Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.put('/:id/holograms/:hologramId/move', async (req, res) => {
  const { id, hologramId } = req.params; // 'id' is "interaction1"
  const { direction } = req.query;

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid direction' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verify current action exists using the readable 'id'
    const [currentRows] = await conn.query(
        'SELECT hologram_id FROM inter_holograms WHERE interaction_id = ? AND hologram_id = ?',
        [id, hologramId]
    );

    if (currentRows.length === 0) {
      throw new Error('Action not found');
    }

    // 2. Find the neighbor based on hologram_id order
    const operator = direction === 'up' ? '<' : '>';
    const order = direction === 'up' ? 'DESC' : 'ASC';

    const [neighbors] = await conn.query(
        `SELECT hologram_id FROM inter_holograms
         WHERE interaction_id = ? AND hologram_id ${operator} ?
         ORDER BY hologram_id ${order} LIMIT 1`,
        [id, hologramId]
    );

    if (neighbors.length === 0) {
      throw new Error(`Cannot move ${direction}: already at the edge.`);
    }

    const neighborId = neighbors[0].hologram_id;
    const tempId = -999; // Use a value unlikely to exist in hologram_id

    // 3. Swap the hologram_ids in inter_actions
    // Current -> Temp
    await conn.query(
        'UPDATE inter_holograms SET hologram_id = ? WHERE interaction_id = ? AND hologram_id = ?',
        [tempId, id, hologramId]
    );
    // Neighbor -> Current's old spot
    await conn.query(
        'UPDATE inter_holograms SET hologram_id = ? WHERE interaction_id = ? AND hologram_id = ?',
        [hologramId, id, neighborId]
    );
    // Temp -> Neighbor's old spot
    await conn.query(
        'UPDATE inter_holograms SET hologram_id = ? WHERE interaction_id = ? AND hologram_id = ?',
        [neighborId, id, tempId]
    );

    // 4. Update the conditions table
    // Note: We use the readable 'id' here because your
    // frontend sends parentId={`${interhologramId}:${action.hologram_id}`}
    const updateCond = async (oldIdx, newIdx) => {
      const oldTypeId = `${id}:${oldIdx}`;
      const newTypeId = `${id}:${newIdx}`;
      await conn.query(
          "UPDATE conditions SET type_id = ? WHERE type = 'particle' AND type_id = ?",
          [newTypeId, oldTypeId]
      );
    };

    // Swap condition references using a temp string to avoid collisions
    await updateCond(hologramId, "TEMP_MOVE");
    await updateCond(neighborId, hologramId);
    await updateCond("TEMP_MOVE", neighborId);

    await conn.commit();
    res.json({ message: 'Action moved successfully' });

  } catch (err) {
    await conn.rollback();
    console.error("Move Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
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

router.put('/:id/holograms/:hologramId', async (req, res) => {
  const { id, hologramId } = req.params;
  const { behaviour, matchtype, hologram } = req.body;

  try {
    // First check if the action exists
    const [existing] = await db.query(
        'SELECT * FROM inter_holograms WHERE interaction_id = ? AND hologram_id = ?',
        [id, hologramId]
    );

    if (existing.length === 0) {
      // If not exists, create it
      await db.query(
          'INSERT INTO inter_holograms (interaction_id, hologram_id, behaviour, matchtype, hologram) VALUES (?, ?, ?, ?, ?)',
          [id, hologramId, behaviour, matchtype, hologram]
      );
      return res.status(201).json({ message: 'Hologram created successfully' });
    }

    // If exists, update it
    const [result] = await db.query(
        'UPDATE inter_holograms SET behaviour = ?, matchtype = ?, hologram = ?  WHERE interaction_id = ? AND hologram_id = ?',
        [behaviour, matchtype, hologram, id, hologramId]
    );

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
    const { id } = req.body;
    const { uuid } = req.query;
  
    if (!id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const [existingRows] = await db.query('SELECT * FROM interactions WHERE id = ?', [id]);
      if (existingRows.length > 0) {
        return res.status(400).json({ error: 'Interaction with this ID already exists' });
      }


      await db.query('INSERT INTO interactions (id) VALUES (?)', [id]);

      const [rows] = await db.query('SELECT * FROM interactions WHERE id = ?', [id]);
  
      res.status(201).json(rows[0]);
  
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

router.delete('/:id', async (req, res) => {
  const {id} = req.params;
  const {uuid} = req.query;

  try {
    await db.query('DELETE FROM inter_actions WHERE id = ?', [id]);
    await db.query('DELETE FROM inter_particles WHERE id = ?', [id]);
    await db.query('DELETE FROM inter_blocks WHERE interaction_id = ?', [id]);
    await db.query('DELETE FROM inter_holograms WHERE interaction_id = ?', [id]);
    await db.query('DELETE FROM inter_npcs WHERE interaction_id = ?', [id]);
    await db.query('DELETE FROM interactions WHERE id = ?', [id]);
    res.status(200).json({message: 'Interaction deleted successfully'});
    
    logActivity({
        type: 'Interaction',
        target_id: id,
        user: uuid,
        action: 'Deleted',
      });
  
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
})

module.exports = router;
