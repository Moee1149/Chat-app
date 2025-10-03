import { handleDisconnect } from "./events-handlers";
import type { Socket } from "socket.io";

export function attachSocketEvents(socket: Socket, userId: string) {
  //attach disconnect handler
  socket.on("disconnect", () => handleDisconnect(socket, userId));

  //attach customer Events
  socket.on("send_message", (message: string) => {
    // Handle sending message logic here
    console.log(message);
  });
}
