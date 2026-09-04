import http from "http";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import app from "./app";
import { initSocket } from "./socket";

async function main() {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(env.port, "0.0.0.0", () => {
      console.log(`[server] SkillBridge API + Socket.io listening on 0.0.0.0:${env.port}`);
    });
  } catch (err) {
    console.error("[server] fatal startup error:", err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("[server] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught Exception:", err);
  process.exit(1);
});

main();
