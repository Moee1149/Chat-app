import { MessageController } from "../../controllers/message-controller";
import { handleDisconnect } from "./events-handlers";
import type { Socket } from "socket.io";

type Message = {
  tempId: string;
  text: string;
  senderId: string; // User ID of sender
  fileUrl?: string;
  chatId: string;
  receiverId?: string;
  status: "pending" | "sent" | "failed";
};

export function attachSocketEvents(socket: Socket, userId: string) {
  //remove any existiong listeners
  socket.removeAllListeners("send_message");
  //attach disconnect handler
  socket.on("disconnect", () => handleDisconnect(socket, userId));

  //attach customer Events
  socket.on("send_message", (message: Message) => {
    MessageController.handleAddNewMessage(socket, message);
  });

  //attaach mark-message-read Events
  socket.on("mark-message-read", (data: { chatId: string; userId: string }) => {
    MessageController.markMessageRead(socket, data.chatId, data.userId);
  });
}
