// chat/routes.js
const router = require("express").Router();
const { getOrCreateRoom, getMessages, getNewMessages } = require("../../chat/db");
const requireAuth = require("../../middleware/auth");

// GET /api/chat/room?entity_type=tool&entity_id=abc123
// GET /api/chat/room?entity_type=general
router.get("/room", requireAuth, async (req, res) => {
    try {
        const { entity_type = "general", entity_id = null } = req.query;
        const room = await getOrCreateRoom(entity_type, entity_id);
        res.json({ room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/messages?entity_type=tool&entity_id=abc123&cursor=<msg_id>&limit=50
router.get("/messages", requireAuth, async (req, res) => {
    try {
        const { entity_type = "general", entity_id = null, cursor, limit } = req.query;
        const room = await getOrCreateRoom(entity_type, entity_id ?? null);
        const result = await getMessages(room.id, cursor, Number(limit) || 50);
        res.json({ room_id: room.id, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/poll?room_id=xxx&after=2024-01-01T00:00:00Z
router.get("/poll", requireAuth, async (req, res) => {
    try {
        const { room_id, after } = req.query;
        if (!room_id) return res.status(400).json({ error: "room_id required" });
        const messages = await getNewMessages(room_id, after ?? new Date(0));
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/messages — fallback for sending messages without Socket.io
router.post("/messages", requireAuth, async (req, res) => {
    try {
        const { entity_type = "general", entity_id = null, content } = req.body;
        if (!content?.trim()) return res.status(400).json({ error: "Empty message" });

        const room = await getOrCreateRoom(entity_type, entity_id ?? null);
        const { insertMessage } = require("../../chat/db");
        const message = await insertMessage(room.id, req.user.uuid, content.trim());

        res.status(201).json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;