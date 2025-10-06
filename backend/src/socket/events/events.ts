import { MessageController } from "../../controllers/message-controller";
import { UserController } from "../../controllers/user-controller";
import { handleDisconnect } from "./events-handlers";
import type { Server, Socket } from "socket.io";

type Message = {
  tempId: string;
  text: string;
  senderId: string; // User ID of sender
  fileUrl?: string;
  chatId: string;
  receiverId?: string;
  status: "pending" | "sent" | "failed";
};

export function attachSocketEvents(socket: Socket, userId: string, io: Server) {
  //remove any existiong listeners
  socket.removeAllListeners("send_message");

  //attach user-online event
  socket.on("user-online", (id: string) => {
    UserController.handleUpdateOnlineStatus(socket, id, true, io);
    console.log(`User ${userId} is online`);
  });

  socket.on("user-offline", (id: string) => {
    UserController.handleUpdateOnlineStatus(socket, id, false, io);
    console.log(`User ${userId} is offline`);
  });

  //attach disconnect handler
  socket.on("disconnect", () => {
    UserController.handleUpdateOnlineStatus(socket, userId, false, io);
    handleDisconnect(socket, userId);
  });

  //attach customer Events
  socket.on("send_message", (message: Message) => {
    MessageController.handleAddNewMessage(socket, message);
  });

  //attaach mark-message-read Events
  socket.on("mark-message-read", (data: { chatId: string; userId: string }) => {
    MessageController.markMessageRead(socket, data.chatId, data.userId);
  });
}
