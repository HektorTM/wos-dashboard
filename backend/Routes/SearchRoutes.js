const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
        return res.status(400).json({ error: 'Please provide a valid search term' });
    }

    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    try {
        const query = `

            SELECT id, display_name, 'citem' AS type FROM citems 
            WHERE LOWER(display_name) LIKE ? OR LOWER(id) LIKE ?
            
            UNION ALL
            
            SELECT id, title, 'title' AS type FROM titles 
            WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ?
            
            UNION ALL
            
            SELECT id, badge, 'badge' AS type FROM badges 
            WHERE LOWER(badge) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ?
        `;

        const results = db.prepare(query).all(
            searchPattern, searchPattern,  // users
            searchPattern, searchPattern,  // citems
            searchPattern, searchPattern,  // titles
            searchPattern, searchPattern   // badges
        );

        // Group results by type for better frontend display
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