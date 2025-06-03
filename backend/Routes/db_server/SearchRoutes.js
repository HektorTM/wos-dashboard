const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL connection

router.get('/', async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
    return res.status(400).json({ error: 'Please provide a valid search term' });
  }

  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  const query = `
  SELECT 
    id COLLATE utf8mb4_general_ci AS id, 
    display_name COLLATE utf8mb4_general_ci AS label, 
    'citem' AS type 
  FROM citems 
  WHERE LOWER(display_name) LIKE ? OR LOWER(id) LIKE ?

  UNION ALL

  SELECT 
    id COLLATE utf8mb4_general_ci AS id, 
    display COLLATE utf8mb4_general_ci AS label, 
    'cosmetic' AS type 
  FROM cosmetics
  WHERE type = 'prefix' AND (
    LOWER(display) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ?
  )

  UNION ALL

  SELECT 
    id COLLATE utf8mb4_general_ci AS id, 
    display COLLATE utf8mb4_general_ci AS label, 
    'cosmetic' AS type 
  FROM cosmetics
  WHERE type = 'title' AND (
    LOWER(display) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ?
  )

  UNION ALL

  SELECT 
    id COLLATE utf8mb4_general_ci AS id, 
    display COLLATE utf8mb4_general_ci AS label, 
    'cosmetic' AS type 
  FROM cosmetics
  WHERE type = 'badge' AND (
    LOWER(display) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ?
  )

  UNION ALL

  SELECT 
    id COLLATE utf8mb4_general_ci AS id, 
    CAST(temp AS CHAR) COLLATE utf8mb4_general_ci AS label, 
    'unlockable' AS type 
  FROM unlockables
  WHERE LOWER(id) LIKE ? OR LOWER(CAST(temp AS CHAR)) LIKE ?

  UNION ALL

  SELECT
    name COLLATE utf8mb4_general_ci AS id,
    format COLLATE utf8mb4_general_ci AS label,
    'channel' AS type
  FROM channels
  WHERE LOWER(name) LIKE ? OR LOWER(format) LIKE ?

  UNION ALL

  SELECT
    uuid COLLATE utf8mb4_general_ci AS id,
    username COLLATE utf8mb4_general_ci AS label,
    'player' AS type
  FROM playerdata
  WHERE username LIKE ?

  UNION ALL

  SELECT
    id COLLATE utf8mb4_general_ci AS id,
    name COLLATE utf8mb4_general_ci AS label,
    'currency' AS type
  FROM currencies
  WHERE LOWER(id) LIKE ? OR name LIKE ?

  UNION ALL

  SELECT 
    id COLLATE utf8mb4_general_ci AS id,
    id COLLATE utf8mb4_general_ci AS label,
    'interaction' AS type
  FROM interactions
  WHERE LOWER(id) LIKE ?

  UNION ALL

  SELECT
    id COLLATE utf8mb4_general_ci AS id,
    citem_id COLLATE utf8mb4_general_ci AS label,
    'fish' AS type
  FROM fishing
  WHERE LOWER(id) LIKE ? OR citem_id LIKE ?
`;


    const params = [
        searchPattern, searchPattern,                     // citems
        searchPattern, searchPattern, searchPattern,      // prefix
        searchPattern, searchPattern, searchPattern,      // title
        searchPattern, searchPattern, searchPattern,      // badge
        searchPattern, searchPattern,                     // unlockables
        searchPattern, searchPattern,                     // channels ✅ (missing before)
        searchPattern, searchPattern,                     // Players
        searchPattern, searchPattern,                     // Currencies
        searchPattern, searchPattern,                     // Interactions
        searchPattern, searchPattern,                     // Fishing 
    ];
  try {
    const [results] = await db.query(query, params);

    const groupedResults = results.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});

    res.json({
      query: searchTerm,
      results: groupedResults,
      total: results.length
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
