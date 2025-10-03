import { ChatModel } from "../../models/ChatModel";
import { handleDisconnect } from "./events-handlers";
import type { Socket } from "socket.io";

type Message = {
  id?: string;
  text: string;
  senderId: string; // User ID of sender
  fileUrl?: string;
  chatId: string;
  seen?: boolean;
  delivered?: boolean;
  createdAt?: string; // This will be ISO string in frontend
};

export function attachSocketEvents(socket: Socket, userId: string) {
  //attach disconnect handler
  socket.on("disconnect", () => handleDisconnect(socket, userId));

  //attach customer Events
  socket.on("send_message", (message: Message) => {
    // Handle sending message logic here
    console.log(message);
  });
}
