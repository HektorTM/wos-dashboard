/*
  Run this once to create the table:

  CREATE TABLE module_overrides (
    module_id           VARCHAR(64)   NOT NULL PRIMARY KEY,
    enabled             TINYINT(1)    DEFAULT NULL,        -- NULL = use module default
    maintenance         TINYINT(1)    DEFAULT NULL,        -- NULL = use module default
    title               VARCHAR(255)  DEFAULT NULL,
    description         TEXT          DEFAULT NULL,
    disabled_routes     JSON          DEFAULT NULL,        -- array of route path strings
    required_permission VARCHAR(255)  DEFAULT NULL,
    updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
*/

const express = require('express');
const router  = express.Router();
const db      = require('../../webmeta');

// ── helpers ──────────────────────────────────────────────────────────────────

/** Map a DB row to the shape the frontend expects. */
function rowToOverride(row) {
    if (!row) return null;
    return {
        moduleId:           row.module_id,
        enabled:            row.enabled    === null ? undefined : Boolean(row.enabled),
        maintenance:        row.maintenance === null ? undefined : Boolean(row.maintenance),
        title:              row.title       ?? undefined,
        description:        row.description ?? undefined,
        disabledRoutes:     row.disabled_routes
            ? (typeof row.disabled_routes === 'string'
                ? JSON.parse(row.disabled_routes)
                : row.disabled_routes)
            : undefined,
        requiredPermission: row.required_permission ?? undefined,
    };
}

// ── GET /module-overrides ─────────────────────────────────────────────────────
// Returns all stored overrides. The frontend batch-fetches these once per request.

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM module_overrides');
        res.status(200).json(rows.map(rowToOverride));
    } catch (err) {
        console.error('GET module-overrides error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /module-overrides/:moduleId ───────────────────────────────────────────

router.get('/:moduleId', async (req, res) => {
    const { moduleId } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM module_overrides WHERE module_id = ?',
            [moduleId]
        );
        if (!rows[0]) return res.status(404).json({ error: 'No override for this module' });
        res.status(200).json(rowToOverride(rows[0]));
    } catch (err) {
        console.error('GET module-override error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /module-overrides/:moduleId ───────────────────────────────────────────
// Creates or fully replaces the override for a module.

router.put('/:moduleId', async (req, res) => {
    const { moduleId } = req.params;
    const { uuid }     = req.query;
    const {
        enabled,
        maintenance,
        title,
        description,
        disabledRoutes,
        requiredPermission,
    } = req.body;

    // enabled / maintenance: accept boolean or undefined (null → store NULL)
    const dbEnabled     = enabled     === undefined ? null : (enabled     ? 1 : 0);
    const dbMaintenance = maintenance === undefined ? null : (maintenance ? 1 : 0);
    const dbRoutes      = Array.isArray(disabledRoutes) && disabledRoutes.length > 0
        ? JSON.stringify(disabledRoutes)
        : null;

    try {
        await db.query(
            `INSERT INTO module_overrides
         (module_id, enabled, maintenance, title, description, disabled_routes, required_permission)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         enabled             = VALUES(enabled),
         maintenance         = VALUES(maintenance),
         title               = VALUES(title),
         description         = VALUES(description),
         disabled_routes     = VALUES(disabled_routes),
         required_permission = VALUES(required_permission)`,
            [
                moduleId,
                dbEnabled,
                dbMaintenance,
                title             ?? null,
                description       ?? null,
                dbRoutes,
                requiredPermission ?? null,
            ]
        );

        const [rows] = await db.query(
            'SELECT * FROM module_overrides WHERE module_id = ?',
            [moduleId]
        );

        res.status(200).json(rowToOverride(rows[0]));
    } catch (err) {
        console.error('PUT module-override error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /module-overrides/:moduleId ────────────────────────────────────────
// Removes the override — the module reverts to its coded defaults.

router.delete('/:moduleId', async (req, res) => {
    const { moduleId } = req.params;
    const { uuid }     = req.query;

    try {
        const [result] = await db.query(
            'DELETE FROM module_overrides WHERE module_id = ?',
            [moduleId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No override found for this module' });
        }

        res.status(200).json({ message: 'Override cleared' });

    } catch (err) {
        console.error('DELETE module-override error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
