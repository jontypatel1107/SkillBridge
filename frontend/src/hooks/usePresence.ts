import { useEffect } from "react";
import { connectSocket, getSocket } from "@/services/socket";
import { useAppDispatch, useAppSelector } from "./redux";
import { setUserOnline, setUserOffline } from "@/redux/slices/presenceSlice";

/**
 * Returns true if the given user id is currently online, and wires the
 * Socket.io presence events so the store stays in sync.
 */
export function usePresence(): {
  onlineIds: string[];
  isOnline: (userId?: string | null) => boolean;
} {
  const dispatch = useAppDispatch();
  const onlineIds = useAppSelector((s) => s.presence.onlineIds);

  useEffect(() => {
    let cleanupFns: (() => void)[] = [];
    let isActive = true;

    connectSocket()
      .then((socket) => {
        if (!isActive) return;

        const onOnline = ({ userId }: { userId: string }) =>
          dispatch(setUserOnline(userId));
        const onOffline = ({ userId }: { userId: string }) =>
          dispatch(setUserOffline(userId));

        socket.on("presence:online", onOnline);
        socket.on("presence:offline", onOffline);

        cleanupFns = [
          () => socket.off("presence:online", onOnline),
          () => socket.off("presence:offline", onOffline),
        ];
      })
      .catch(() => {});

    return () => {
      isActive = false;
      cleanupFns.forEach((fn) => fn());
    };
  }, [dispatch]);

  return {
    onlineIds,
    isOnline: (userId) => (userId ? onlineIds.includes(userId) : false),
  };
}

export function isSocketConnected(): boolean {
  return getSocket()?.connected ?? false;
}
