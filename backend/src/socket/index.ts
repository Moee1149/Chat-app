//socket initialization
import { Server, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import { attachSocketEvents } from "./events/events";

//Track active connections
export const connections = new Map<string, Socket>();

//Track user connections
export const userSessions = new Map<string, Set<string>>();

export function initialzeSocketIO(httpServer: HTTPServer) {
  //create socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ORIGIN || "http://localhost:3000",
    },
  });

  //Apply middleware

  //Handle Connection
  io.on("connection", (socket) => {
    //store socket reference
    connections.set(socket.id, socket);
    //Track user session
    socket.once("user_connected", (id: string) => {
      const userId = id;
      if (!userSessions.has(userId)) {
        userSessions.set(userId, new Set());
      }
      userSessions.get(userId)!.add(socket.id);
      console.log(`User ${userId} connected (Socket ID: ${socket.id})`);
      attachSocketEvents(socket, userId, io);
    });
  });

  return io;
}

export function isUserConnected(userId: string): boolean {
  return userSessions.has(userId) && userSessions.get(userId)!.size > 0;
}
