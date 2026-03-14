const express = require('express');
const router = express.Router();
const db = require('../../db');
const logActivity = require('../../utils/LogActivity');

// Get all dialogs
router.get('/', async (req, res) => {
    try {
        const [dialogs] = await db.query('SELECT * FROM dialogs');
        res.json(dialogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create dialog
router.post('/', async (req, res) => {
    const { id, settings } = req.body;
    const { uuid } = req.query;
    try {
        if (!id || !settings) {
            return res.status(400).json({ error: 'Missing required field' });
        }

        const [existingRows] = await db.query('SELECT id FROM dialogs WHERE id = ?', [id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Dialog with this ID already exists' });
        }

        await db.query('INSERT INTO dialogs (id, settings) VALUES (?, ?)', [id, JSON.stringify(settings)]);
        const [[row]] = await db.query('SELECT * FROM dialogs WHERE id = ?', [id]);

        res.status(201).json(row);

        await logActivity({ type: 'Dialog', target_id: id, user: uuid, action: 'Created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get full dialog by ID (pages → lines + answers → conditions)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [[dialog]] = await db.query('SELECT * FROM dialogs WHERE id = ?', [id]);
        if (!dialog) return res.status(404).json({ error: 'Dialog not found' });

        const [pageRows] = await db.query(
            'SELECT * FROM dialog_pages WHERE dialog_id = ? ORDER BY page_id ASC', [id]
        );
        const [lineRows] = await db.query(
            'SELECT * FROM page_lines WHERE dialog_id = ? ORDER BY page_id ASC, line_id ASC', [id]
        );
        const [answerRows] = await db.query(
            'SELECT * FROM dialog_answers WHERE dialog_id = ? ORDER BY page_id ASC, answer_id ASC', [id]
        );
        const [conditionRows] = await db.query(
            "SELECT * FROM conditions WHERE type = 'answer' AND type_id LIKE ?",
            [`${id}:%`]
        );

        // Build condition map keyed by `${pageId}:${answerId}`
        const conditionsByKey = {};
        for (const row of conditionRows) {
            const parts = row.type_id.split(':'); // [dialogId, pageId, answerId]
            const key = `${parts[1]}:${parts[2]}`;
            if (!conditionsByKey[key]) conditionsByKey[key] = [];
            conditionsByKey[key].push({
                type: row.type,
                type_id: row.type_id,
                condition_id: row.condition_id,
                condition_key: row.condition_key,
                value: row.value,
                parameter: row.parameter,
            });
        }

        // Group lines by page_id
        const linesByPage = {};
        for (const line of lineRows) {
            if (!linesByPage[line.page_id]) linesByPage[line.page_id] = [];
            linesByPage[line.page_id].push(line.line_text);
        }

        // Group answers by page_id
        const answersByPage = {};
        for (const answer of answerRows) {
            if (!answersByPage[answer.page_id]) answersByPage[answer.page_id] = [];
            answersByPage[answer.page_id].push({
                id: String(answer.answer_id),
                answer_text: answer.answer_text,
                go_to: answer.go_to,
                sound: answer.sound,
                reply_message: answer.reply_message ?? null,
                action: answer.action ?? null,
                conditions: conditionsByKey[`${answer.page_id}:${answer.answer_id}`] ?? [],
            });
        }

        const pages = pageRows.map(page => ({
            id: String(page.page_id),
            timer: page.timer ?? null,
            go_to: page.go_to ?? null,
            pre_action: page.pre_action ?? null,
            post_action: page.post_action ?? null,
            exit_action: page.exit_action ?? null,
            lines: linesByPage[page.page_id] ?? [],
            answers: answersByPage[page.page_id] ?? [],
        }));

        res.json({
            id: dialog.id,
            settings: typeof dialog.settings === 'string' ? JSON.parse(dialog.settings) : dialog.settings,
            pages,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update dialog settings
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;
    const { settings } = req.body;

    if (!settings) return res.status(400).json({ error: 'Settings are required.' });

    try {
        const [[existing]] = await db.query('SELECT id FROM dialogs WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'Dialog not found' });

        await db.query('UPDATE dialogs SET settings = ? WHERE id = ?', [JSON.stringify(settings), id]);

        res.status(200).json({ id, settings });

        await logActivity({ type: 'Dialog', target_id: id, user: uuid, action: 'Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete dialog and all associated data
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid } = req.query;
    try {
        await db.query("DELETE FROM conditions WHERE type = 'answer' AND type_id LIKE ?", [`${id}:%`]);
        await db.query('DELETE FROM dialog_answers WHERE id = ?', [id]);
        await db.query('DELETE FROM page_lines WHERE id = ?', [id]);
        await db.query('DELETE FROM dialog_pages WHERE id = ?', [id]);
        const [result] = await db.query('DELETE FROM dialogs WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dialog not found' });
        }

        await logActivity({ type: 'Dialog', target_id: id, user: uuid, action: 'Deleted' });
        return res.status(200).json({ message: 'Dialog and associated data deleted successfully' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ── Pages ─────────────────────────────────────────────────────────────────────

router.get('/:id/pages', async (req, res) => {
    const { id } = req.params;
    try {
        const [pages] = await db.query('SELECT * FROM dialog_pages WHERE id = ? ORDER BY page_id ASC', [id]);
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/pages', async (req, res) => {
    const { id } = req.params;
    const { page_id , timer, go_to, pre_action, post_action, exit_action } = req.body;
    try {
        await db.query(
            'INSERT INTO dialog_pages (dialog_id, page_id, timer, go_to, pre_action, post_action, exit_action) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, page_id, timer ?? null, go_to ?? null, pre_action ?? null, post_action ?? null, exit_action ?? null]
        );

        res.status(201).json({
            id: String(page_id),
            timer: timer ?? null,
            go_to: go_to ?? null,
            pre_action: pre_action ?? null,
            post_action: post_action ?? null,
            exit_action: exit_action ?? null,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/pages/:page_id', async (req, res) => {
    const { id, page_id } = req.params;
    const { timer, go_to, pre_action, post_action, exit_action } = req.body;

    try {
        await db.query(
            'UPDATE dialog_pages SET timer = ?, go_to = ?, pre_action = ?, post_action = ?, exit_action = ? WHERE dialog_id = ? AND page_id = ?',
            [timer ?? null, go_to ?? null, pre_action ?? null, post_action ?? null, exit_action ?? null, id, page_id]
        );

        res.status(200).json({
            id: String(page_id),
            timer: timer ?? null,
            go_to: go_to ?? null,
            pre_action: pre_action ?? null,
            post_action: post_action ?? null,
            exit_action: exit_action ?? null,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id/page/:pageId', async (req, res) => {
    const { id, pageId } = req.params;
    try {
        // Delete answer conditions for this page
        await db.query(
            "DELETE FROM conditions WHERE type = 'answer' AND type_id LIKE ?",
            [`${id}:${pageId}:%`]
        );
        await db.query('DELETE FROM dialog_answers WHERE id = ? AND page_id = ?', [id, pageId]);
        await db.query('DELETE FROM page_lines WHERE id = ? AND page_id = ?', [id, pageId]);
        const [result] = await db.query('DELETE FROM dialog_pages WHERE id = ? AND page_id = ?', [id, pageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        return res.status(200).json({ message: 'Page and associated data deleted successfully' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ── Lines ─────────────────────────────────────────────────────────────────────

router.get('/:id/pages/:pageid/lines', async (req, res) => {
    const { id, pageid } = req.params;
    try {
        const [lines] = await db.query(
            'SELECT * FROM page_lines WHERE id = ? AND page_id = ? ORDER BY line_id ASC', [id, pageid]
        );
        res.json(lines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/pages/:pageid/lines', async (req, res) => {
    const { id, pageid } = req.params;
    const { lines } = req.body;
    try {
        if (!Array.isArray(lines)) return res.status(400).json({ error: 'lines must be an array' });

        await db.query('DELETE FROM page_lines WHERE dialog_id = ? AND page_id = ?', [id, pageid]);

        for (let i = 0; i < lines.length; i++) {
            await db.query(
                'INSERT INTO page_lines (dialog_id, page_id, line_id, line_text) VALUES (?, ?, ?, ?)',
                [id, pageid, i + 1, lines[i]]
            );
        }

        res.status(200).json({ lines });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/page/:page_id/lines/:lineId', async (req, res) => {
    const { id, page_id, lineId } = req.params;
    const { line_text } = req.body;

    if (!line_text) return res.status(400).json({ error: 'Line text is required.' });

    try {
        await db.query(
            'UPDATE page_lines SET line_text = ? WHERE id = ? AND page_id = ? AND line_id = ?',
            [line_text, id, page_id, lineId]
        );
        res.status(200).json({ message: 'Updated Line' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id/page/:pageId/line/:lineId', async (req, res) => {
    const { id, pageId, lineId } = req.params;
    try {
        const [result] = await db.query(
            'DELETE FROM page_lines WHERE id = ? AND page_id = ? AND line_id = ?', [id, pageId, lineId]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Line not found' });
        return res.status(200).json({ message: 'Line deleted successfully' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ── Answers (per page) ────────────────────────────────────────────────────────

router.post('/:id/pages/:pageId/answers', async (req, res) => {
    const { id, pageId } = req.params;
    const { answer_text, go_to, sound, reply_message, action } = req.body;

    if (!answer_text) return res.status(400).json({ error: 'answer_text is required.' });

    try {
        const [maxIdResult] = await db.query(
            'SELECT MAX(answer_id) as maxId FROM dialog_answers WHERE dialog_id = ? AND page_id = ?', [id, pageId]
        );
        const nextAnswerId = (maxIdResult[0].maxId || 0) + 1;

        await db.query(
            'INSERT INTO dialog_answers (dialog_id, page_id, answer_id, answer_text, go_to, sound, reply_message, action) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, pageId, nextAnswerId, answer_text, go_to ?? null, sound ?? null, reply_message ?? null, action ?? null]
        );

        res.status(201).json({
            id: String(nextAnswerId),
            answer_text,
            go_to: go_to ?? null,
            sound: sound ?? null,
            reply_message: reply_message ?? null,
            action: action ?? null,
            conditions: [],
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/pages/:pageId/answer/:answerId', async (req, res) => {
    const { id, pageId, answerId } = req.params;
    const { answer_text, go_to, sound, reply_message, action } = req.body;

    if (!answer_text) return res.status(400).json({ error: 'answer_text is required.' });

    try {
        await db.query(
            'UPDATE dialog_answers SET answer_text = ?, go_to = ?, sound = ?, reply_message = ?, action = ? WHERE id = ? AND page_id = ? AND answer_id = ?',
            [answer_text, go_to ?? null, sound ?? null, reply_message ?? null, action ?? null, id, pageId, answerId]
        );
        res.status(200).json({ message: 'Updated Answer' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id/pages/:pageId/answer/:answerId', async (req, res) => {
    const { id, pageId, answerId } = req.params;
    try {
        await db.query(
            "DELETE FROM conditions WHERE type = 'answer' AND type_id = ?",
            [`${id}:${pageId}:${answerId}`]
        );
        await db.query(
            'DELETE FROM dialog_answers WHERE id = ? AND page_id = ? AND answer_id = ?', [id, pageId, answerId]
        );
        res.status(200).json({ message: 'Deleted Answer' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;