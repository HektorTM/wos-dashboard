const express = require('express');
const router = express.Router();
const db = require('../../db'); // MySQL connection
const logActivity = require('../../utils/LogActivity');
const {text} = require("express");

// ✅ Get all interactions
router.get('/', async (req, res) => {
    try {
        const [dialogs] = await db.query('SELECT * FROM dialogs');
        res.json(dialogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { dialog_id, char_name, uuid } = req.body;
    try {
        if (!dialog_id || !char_name) {
            return res.status(400).json({ error: 'Missing required field' });
        }

        const [exisingRows] = await db.query('SELECT * FROM dialogs WHERE dialog_id = ?', [dialog_id]);
        if (exisingRows.length > 0) {
            return res.status(400).json({ error: 'Dialog with this ID already exists' });
        }
        const [result] = await db.query('INSERT INTO dialogs (dialog_id, char_name) VALUES (?, ?)', [dialog_id, char_name]);

        res.status(201).json({ message: 'Dialog created successfully'});
        await logActivity(
            {
                type: 'Dialog',
                target_id: dialog_id,
                user: uuid,
                action: 'Created',
            }
        )
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// ✅ Get interaction by ID (with actions + holograms + blocks + npcs)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [dialogRows] = await db.query('SELECT * FROM dialogs WHERE dialog_id = ?', [id]);
        if (dialogRows.length === 0) {
            return res.status(404).json({ error: 'Interaction not found' });
        }


        res.json(dialogRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { char_name, char_name_color, text_color, background_color, answer_background_color, fog_color, arrow_color, selected_color } = req.body;

    if (!char_name) {
        return res.status(400).json({ error: 'Character Name is required.' });
    }

    try {
        // Check if cosmetic exists
        const [existingRows] = await db.query('SELECT * FROM dialogs WHERE dialog_id = ?', [id]);
        if (!existingRows[0]) {
            return res.status(404).json({ error: 'Dialog not found' });
        }

        // Update the cosmetic
        const [result] = await db.query(`
            UPDATE dialogs
            SET char_name = ?, char_name_color = ?, text_color = ?, background_color = ?, answer_background_color = ?, fog_color = ?, arrow_color = ?, selected_color = ?
            WHERE dialog_id = ?
        `, [char_name, char_name_color, text_color, background_color, answer_background_color, fog_color, arrow_color, selected_color ,id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No changes were made to the Dialog.' });
        }

        res.status(200).json({
            dialog_id: id,
            char_name: char_name,
            char_name_color: char_name_color,
            text_color: text_color,
            background_color: background_color,
            answer_background_color: answer_background_color,
            fog_color: fog_color,
            arrow_color: arrow_color,
            selected_color: selected_color
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
   const { id } = req.params;
   const { uuid } = req.body;
   try {
       await db.query('DELETE FROM dialog_pages WHERE dialog_id = ?', [id]);
       await db.query('DELETE FROM page_lines WHERE dialog_id = ?', [id]);
       await db.query('DELETE FROM dialog_answers WHERE dialog_id = ?', [id]);
       const [result] = await db.query('DELETE FROM dialogs WHERE dialog_id = ?', [id]);

       if (result.affectedRows === 0) {
           return res.status(404).json({ error: 'Dialog not found' });
       }
       await logActivity({
              type: 'Dialog',
              target_id: id,
              user: uuid,
              action: 'Deleted',
       });
       return res.status(200).json({ message: 'Dialog and associated data deleted successfully' });
   } catch (err) {
       console.error(err.message);
       return res.status(500).json({ error: err.message });
   }
});

// ✅ Get only actions for interaction
router.get('/:id/pages', async (req, res) => {
    const { id } = req.params;
    try {
        const [pages] = await db.query('SELECT * FROM dialog_pages WHERE dialog_id = ? ORDER BY page_id ASC', [id]);
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/:id/page', async (req, res) => {
    const { id } = req.params;
    const { pre_action, post_action } = req.body;
    try {
        const [maxIdResult] = await db.query(
            'SELECT MAX(page_id) as maxId FROM dialog_pages WHERE dialog_id = ?',
            [id]
        );
        const nextPageId = (maxIdResult[0].maxId || 0) + 1;

        await db.query(
            'INSERT INTO dialog_pages (dialog_id, page_id, pre_action, post_action) VALUES (?, ?, ?, ?)',
            [id, nextPageId, pre_action || null, post_action || null]
        );

        // return the created page shape expected by the client
        res.status(201).json({
            page_id: nextPageId,
            pre_action: pre_action || '',
            post_action: post_action || '',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/page/:page_id', async (req, res) => {
    const { id, page_id } = req.params;
    const { pre_action, post_action } = req.body;

    try {
        await db.query(
            'UPDATE dialog_pages SET pre_action = ?, post_action = ? WHERE dialog_id = ? AND page_id = ?',
            [pre_action ?? null, post_action ?? null, id, page_id]
        );

        // Return the updated values (normalize nulls to empty strings if your UI expects strings)
        res.status(200).json({
            page_id: Number(page_id),
            pre_action: pre_action ?? '',
            post_action: post_action ?? '',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/page/:page_id/lines/:lineId', async (req, res) => {
    const { id, page_id, lineId } = req.params;
    const { line_text } = req.body;
    console.log(`ID: ${id}\n PageID: ${page_id}\n LineID: ${lineId}\n line_text : ${line_text}`);
    if (!line_text) {
        return res.status(400).json({ error: 'Line text is required.' });
    }

    try {
        await db.query(
            'UPDATE page_lines SET line_text = ? WHERE dialog_id = ? AND page_id = ? AND line_id = ?',
            [line_text, id, page_id, lineId]
        );

        // Return the updated values (normalize nulls to empty strings if your UI expects strings)
        res.status(200).json({message: 'Updated Line'});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id/page/:pageId', async (req, res) => {
    const { id, pageId } = req.params;
    try {
        await db.query('DELETE FROM page_lines WHERE dialog_id = ? AND page_id = ?', [id, pageId]);
        const [result] = await db.query('DELETE FROM dialog_pages WHERE dialog_id = ? AND page_id = ?', [id, pageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        return res.status(200).json({ message: 'Page and associated data deleted successfully' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/:id/pages/:pageid/lines', async (req, res) => {
    const { id, pageid } = req.params;
    try {
        const [lines] = await db.query('SELECT * FROM page_lines WHERE dialog_id = ? AND page_id = ? ORDER BY line_id ASC', [id, pageid]);
        res.json(lines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/pages/:pageid/line', async (req, res) => {
    const { id, pageid } = req.params;
    const { line_text } = req.body;
    try {
        if (!line_text) {
            return res.status(400).json({ error: 'Line text is required' });
        }

        const [maxIdResult] = await db.query(
            'SELECT MAX(line_id) as maxId FROM page_lines WHERE dialog_id = ? AND page_id = ?',
            [id, pageid]
        );
        const nextLineId = (maxIdResult[0].maxId || 0) + 1;

        await db.query(
            'INSERT INTO page_lines (dialog_id, page_id, line_id, line_text) VALUES (?, ?, ?, ?)',
            [id, pageid, nextLineId, line_text]
        );

        res.status(201).json({
            line_id: nextLineId,
            line_text: line_text
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id/page/:pageId/line/:lineId', async (req, res) => {
    const { id, pageId, lineId } = req.params;
    try {
        const [result] = await db.query('DELETE FROM page_lines WHERE dialog_id = ? AND page_id = ? AND line_id = ?', [id, pageId, lineId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Line not found' });
        }
        return res.status(200).json({ message: 'Page and associated data deleted successfully' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});


router.post('/:id/answer', async (req, res) => {
    const { id } = req.params;
    const { answer_text, answer_action } = req.body;

    const [maxIdResult] = await db.query(
        'SELECT MAX(answer_id) as maxId FROM dialog_answers WHERE dialog_id = ?',
        [id]
    );
    const nextAnswerId = (maxIdResult[0].maxId || 0) + 1;

    try {
        await db.query('INSERT INTO dialog_answers (dialog_id, answer_id, answer_text,  answer_action) VALUES (?,?,?,?,?) ', [id, nextAnswerId, answer_text, answer_action]);
        res.status(200).json({message: 'Added Answer'});
    }  catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id/answer/:answerId', async (req, res) => {
    const { id, answerId } = req.params;
    try {
        await db.query('DELETE FROM dialog_answers WHERE dialog_id = ? AND answer_id = ?', [id, answerId]);
        res.status(200).json({message: 'Deleted Answer'});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
})

router.patch('/:id/answer/:answerId', async (req, res) => {
    const { id, answerId } = req.params;
    const { answer_text, answer_action } = req.body;
    if (!answer_text || !answer_action) {
        return res.status(400).json({ error: 'Answer text and Answer action is required.' });
    }

    try {
        await db.query('UPDATE dialog_answers SET answer_text = ?, answer_action = ? WHERE dialog_id = ? AND answer_id = ?', [answer_text, answer_action, id, answerId]);
        res.status(200).json({message: 'Updated Answer'});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
})

router.get('/:id/answers', async (req, res) => {
    const { id } = req.params;
    try {
        const [answers] = await db.query('SELECT * FROM dialog_answers WHERE dialog_id = ?', [id]);
        res.json(answers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
