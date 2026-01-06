const express = require("express");
const router = express.Router();
const db = require("../../db"); // MySQL connection

/**
 * HOW TO ADD MORE TYPES:
 *
 * 1. Add a new UNION ALL block with:
 *    - id
 *    - label
 *    - 'your_type_name' AS type
 *
 * 2. Add matching search params at the bottom
 *
 * 3. (Optional) Add it to frontend filter list
 */

router.get("/", async (req, res) => {
    const searchTerm = req.query.q;
    const filter = req.query.filter;

    if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
        return res.status(400).json({ error: "Invalid search term" });
    }

    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    const query = `
        SELECT name AS id, name AS label, 'channels' AS type
        FROM channels
        WHERE LOWER(name) LIKE ?
           OR LOWER('format') LIKE ?

        UNION ALL

        SELECT id COLLATE utf8mb4_general_ci AS id,
               id COLLATE utf8mb4_general_ci AS label,
               'citems' AS type
        FROM items
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id COLLATE utf8mb4_general_ci AS id,
               id COLLATE utf8mb4_general_ci AS label,
               'constants' AS type
        FROM constants
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id COLLATE utf8mb4_general_ci AS id,
               id COLLATE utf8mb4_general_ci AS label,
               'cooldowns' AS type
        FROM cooldowns
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT command AS id,
               command AS label,
               'commands' AS type
        FROM commands
        WHERE LOWER(command) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'cosmetics' AS type
        FROM cosmetics
        WHERE type IN ('prefix', 'title', 'badge')
          AND (
            LOWER(display) LIKE ?
                OR LOWER(description) LIKE ?
                OR LOWER(id) LIKE ?
            )

        UNION ALL

        SELECT id AS id, id AS label, 'currencies' AS type
        FROM currencies
        WHERE LOWER(id) LIKE ?
           OR LOWER(name) LIKE ?

        UNION ALL

        SELECT dialog_id AS id, dialog_id AS label, 'dialogs' AS type
        FROM dialogs
        WHERE LOWER(dialog_id) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'fishing' AS type
        FROM fishing
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'global_stats' AS type
        FROM global_stats
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'guis' AS type
        FROM guis
        WHERE LOWER(id) LIKE ?
           OR LOWER(title) LIKE ?
        
        UNION ALL

        SELECT id AS id, id AS label, 'interactions' AS type
        FROM interactions
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'loottables' AS type
        FROM loottables
        WHERE LOWER(id) LIKE ?

        UNION ALL
        
        SELECT id AS id, id AS label, 'stats' AS type
        FROM stats
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'time_events' AS type
        FROM activities
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT id AS id, id AS label, 'unlockables' AS type
        FROM unlockables
        WHERE LOWER(id) LIKE ?

        UNION ALL

        SELECT uuid AS id, username AS label, 'players' AS type
        FROM playerdata
        WHERE LOWER(username) LIKE ?
       
    `;

/*
        UNION ALL

        SELECT id AS id, id AS label, 'recipes' AS type
        FROM recipes
        WHERE LOWER(id) LIKE ?
*/

    const PARAMS = [
        2, // channels
        1, // citems
        1, // constants
        1, // cooldowns
        1, // commands
        3, // cosmetics
        2, // currencies
        1, // dialogs
        1, // fishing
        1, // global_stats
        2, // guis
        1, // interactions
        1, // loottables
      //  1, // recipes
        1, // stats
        1, // time_events
        1, // unlockables
        1, // players
    ];

    const params = PARAMS.flatMap((count) =>
        Array(count).fill(searchPattern)
    );

    try {
        let [rows] = await db.query(query, params);

        // Apply filter AFTER SQL (safe & flexible)
        if (filter) {
            rows = rows.filter((row) => row.type === filter);
        }

        // Group by type
        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.type]) acc[row.type] = [];
            acc[row.type].push({
                id: row.id,
                label: row.label,
                nav: `/${row.type}/${row.id}`, // 👈 centralized routing
                icon: row.type,               // 👈 frontend icon map
            });
            return acc;
        }, {});

        res.json({
            query: searchTerm,
            total: rows.length,
            results: grouped,
        });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
