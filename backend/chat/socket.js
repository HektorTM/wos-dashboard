// chat/socket.js
const { Server } = require("socket.io");
const { getOrCreateRoom, getMessages, insertMessage } = require("./db");
const db = require("../webmeta.js"); // your existing db

function initSocket(httpServer, allowedOrigin, sessionMiddleware) {

    console.log("[chat] initSocket called, origins:", allowedOrigin); // add this
    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigin.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: "/socket.io",
    });

    // Pipe Express session into Socket.io
    io.engine.use(sessionMiddleware);

    // Mirror your requireAuth middleware
    io.use(async (socket, next) => {
        const session = socket.request.session;

        if (!session?.user?.uuid) {
            return next(new Error("Unauthorized"));
        }

        try {
            const [rows] = await db.execute(
                "SELECT uuid, username, role, is_active FROM users WHERE uuid = ?",
                [session.user.uuid]
            );

            const user = rows[0];

            if (!user) {
                return next(new Error("Invalid Session"));
            }

            if (!user.is_active) {
                return next(new Error("Account Disabled"));
            }

            // Attach verified user to socket — same shape as req.user in your routes
            socket.user = {
                uuid: user.uuid,
                username: user.username,
                role: user.role,
                is_active: user.is_active,
            };

            next();
        } catch (err) {
            console.error("[chat] auth error:", err);
            next(new Error("Authentication Error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`[chat] connected: ${socket.user.uuid}`);

        socket.on("join_room", async ({ entity_type = "general", entity_id = null }) => {
            try {
                const room = await getOrCreateRoom(entity_type, entity_id);

                [...socket.rooms]
                    .filter((r) => r !== socket.id)
                    .forEach((r) => socket.leave(r));

                socket.join(room.id);

                const { messages } = await getMessages(room.id, null, 50);
                socket.emit("room_joined", { room_id: room.id, messages });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("send_message", async ({ entity_type = "general", entity_id = null, content }) => {
            try {
                if (!content?.trim()) return;

                const room = await getOrCreateRoom(entity_type, entity_id);
                const message = await insertMessage(room.id, socket.user.uuid, content.trim());

                io.to(room.id).emit("new_message", message);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`[chat] disconnected: ${socket.user.uuid}`);
        });
    });

    return io;
}

module.exports = { initSocket };