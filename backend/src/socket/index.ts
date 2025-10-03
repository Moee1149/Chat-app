//socket initialization
import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

//Track active connections
const connections = new Map();

//Track user connections
const userSessions = new Map();

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
    console.log(connections);
    // //Track user session
    // const userId = socket.data.userId;
    // if (userId) {
    //   if (!userSessions.has(userId)) {
    //     userSessions.set(userId, new Set());
    //   }
    //   userSessions.get(userId).add(socket.id);
    // }

    // console.log(
    //   `Socket connected: ${socket.id}${userId ? ` (User: ${userId})` : ""}`,
    // );
  });

  return io;
}
