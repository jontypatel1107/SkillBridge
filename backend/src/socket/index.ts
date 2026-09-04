import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { Message } from "../models/Message";
import { notify } from "../services/notificationService";
import { env } from "../config/env";

interface AuthedSocket extends Socket {
  userId?: string;
}

const onlineUsers = new Map<string, Set<string>>();

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Missing auth token"));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.userId!;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);
    socket.join(userId);
    io.emit("presence:online", { userId });

    socket.on("message:send", async (payload: { recipientId: string; text?: string; imageUrl?: string; bookingId?: string }) => {
      try {
        const { recipientId, text, imageUrl, bookingId } = payload;
        if (!recipientId || (!text && !imageUrl)) return;

        const message = await Message.create({
          sender: userId,
          recipient: recipientId,
          text,
          imageUrl,
          booking: bookingId,
        });

        io.to(recipientId).emit("message:new", message);
        io.to(userId).emit("message:new", message);

        const recipientOnline = onlineUsers.has(recipientId);
        if (!recipientOnline) {
          await notify({
            recipient: recipientId,
            type: "new_message",
            title: "New message",
            body: text ? text.slice(0, 100) : "Sent you an image",
            relatedId: message._id,
          });
        }
      } catch (err) {
        console.error("[socket] message:send error:", err);
      }
    });

    socket.on("typing:start", ({ recipientId }: { recipientId: string }) => {
      io.to(recipientId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ recipientId }: { recipientId: string }) => {
      io.to(recipientId).emit("typing:stop", { userId });
    });

    socket.on("message:read", async ({ otherUserId }: { otherUserId: string }) => {
      try {
        await Message.updateMany(
          { sender: otherUserId, recipient: userId, readAt: { $exists: false } },
          { readAt: new Date() }
        );
        io.to(otherUserId).emit("message:read", { by: userId });
      } catch (err) {
        console.error("[socket] message:read error:", err);
      }
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      sockets?.delete(socket.id);
      if (sockets && sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence:offline", { userId });
      }
    });
  });

  return io;
}
