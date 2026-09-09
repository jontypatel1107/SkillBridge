import { io, Socket } from "socket.io-client";
import { tokenStorage } from "@/utils/tokenStorage";
import { getServerUrls, resetServerUrls } from "@/config/serverUrl";

let socket: Socket | null = null;
let socketUrl: string | null = null;
let connectErrorCount = 0;
const NETWORK_SWITCH_THRESHOLD = 5;

async function handleConnectError(): Promise<void> {
  connectErrorCount += 1;
  const freshToken = await tokenStorage.getAccessToken();
  if (socket) {
    socket.auth = { token: freshToken };
  }

  if (connectErrorCount < NETWORK_SWITCH_THRESHOLD) {
    return;
  }
  connectErrorCount = 0;
  resetServerUrls();
  const resolved = await getServerUrls();
  if (socket && socketUrl && resolved.socketUrl !== socketUrl) {
    socket.disconnect();
    socketUrl = resolved.socketUrl;
    const reToken = await tokenStorage.getAccessToken();
    socket = buildSocket(resolved.socketUrl, reToken ?? "");
  } else {
    socket?.connect();
  }
}

function buildSocket(url: string, token: string): Socket {
  const created = io(url, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    timeout: 10000,
  });
  created.on("connect_error", handleConnectError);
  return created;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const fresh = await getServerUrls();
  const token = await tokenStorage.getAccessToken();

  const urlChanged = socket && socketUrl && fresh.socketUrl && socketUrl !== fresh.socketUrl;
  if (urlChanged) {
    socket?.disconnect();
    socket = null;
  }

  if (!socket) {
    socketUrl = fresh.socketUrl;
    socket = buildSocket(fresh.socketUrl, token ?? "");
  }

  return socket!;
}

export async function refreshSocketToken(): Promise<void> {
  if (!socket) return;
  const freshToken = await tokenStorage.getAccessToken();
  if (freshToken) {
    socket.auth = { token: freshToken };
    if (socket.connected) {
      socket.disconnect();
      socket.connect();
    }
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  socketUrl = null;
  connectErrorCount = 0;
}