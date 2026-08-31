import http from "http";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import app from "./app";
import { initSocket } from "./socket";

async function main() {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[server] SkillBridge API + Socket.io listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error("[server] fatal startup error:", err);
  process.exit(1);
});
