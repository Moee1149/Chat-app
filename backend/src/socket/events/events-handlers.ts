import { connections, userSessions } from "../index";
import type { Socket } from "socket.io";

export function handleDisconnect(socket: Socket, userId: string): void {
  connections.delete(socket.id);

  if (userId && userSessions.has(userId)) {
    userSessions.get(userId)?.delete(socket.id);

    // Clean up empty user sessions
    if (userSessions.get(userId)?.size === 0) {
      userSessions.delete(userId);
    }

    console.log(`User ${userId} disconnected (Socket ID: ${socket.id})`);
  } else {
    console.log(`Socket disconnected: ${socket.id}`);
  }
}
