// chat/db.js
const db = require("../webmeta"); // your existing mysql2 pool


function buildRoomId(entity_type, entity_id = null) {
    if (entity_id === null) return `general`;
    return `${entity_type}__${entity_id}`;
}

async function getOrCreateRoom(entity_type, entity_id = null) {
    const room_id = buildRoomId(entity_type, entity_id);

    await db.query(
        `INSERT IGNORE INTO chat_rooms (id, entity_type, entity_id)
     VALUES (?, ?, ?)`,
        [room_id, entity_type, entity_id]
    );

    return { id: room_id };
}

async function getMessages(room_id, cursor = null, limit = 50) {
    const cap = Math.min(limit, 100);

    const [rows] = await db.query(
        `SELECT
             m.id, m.content, m.created_at, m.user_uuid
         FROM chat_messages m
         WHERE m.room_id = ?
             ${cursor ? "AND m.created_at < (SELECT created_at FROM chat_messages WHERE id = ?)" : ""}
         ORDER BY m.created_at DESC
            LIMIT ?`,
        cursor ? [room_id, cursor, cap + 1] : [room_id, cap + 1]
    );

    const hasMore = rows.length > cap;
    if (hasMore) rows.pop();
    return { messages: rows.reverse(), hasMore };
}

async function insertMessage(room_id, user_uuid, content) {
    const id = crypto.randomUUID();

    await db.query(
        `INSERT INTO chat_messages (id, room_id, user_uuid, content)
     VALUES (?, ?, ?, ?)`,
        [id, room_id, user_uuid, content]
    );

    const [rows] = await db.query(
        `SELECT id, content, created_at, user_uuid
     FROM chat_messages
     WHERE id = ?`,
        [id]
    );

    return rows[0];
}

async function getNewMessages(room_id, after_timestamp) {
    const [rows] = await db.query(
        `SELECT id, content, created_at, user_uuid
     FROM chat_messages
     WHERE room_id = ? AND created_at > ?
     ORDER BY created_at ASC
     LIMIT 50`,
        [room_id, after_timestamp]
    );

    return rows;
}

module.exports = { buildRoomId, getOrCreateRoom, getMessages, insertMessage, getNewMessages };