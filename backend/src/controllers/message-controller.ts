import { type Socket } from "socket.io";
import { ChatModel } from "../models/ChatModel";
import { connections, userSessions } from "../socket";

type MessageType = {
  tempId?: string;
  senderId: string;
  receiverId?: string;
  text: string;
  chatId: string;
  file?: string;
  status?: "pending" | "sent" | "failed" | "received";
};

export class MessageController {
  static async handleAddNewMessage(
    socket: Socket,
    { receiverId, chatId, senderId, text, tempId }: MessageType,
  ) {
    try {
      const message = await ChatModel.saveMessage({ chatId, senderId, text });
      socket.emit("message-ack", { ...message, tempId, status: "sent" });

      if (receiverId) {
        const receiverSocketIds = userSessions.get(receiverId);

        if (receiverSocketIds && receiverSocketIds.size > 0) {
          console.log(
            `Sending message to ${receiverId} on ${receiverSocketIds.size} sockets`,
          );

          // Loop through all the receiver's socket IDs
          receiverSocketIds.forEach((socketId) => {
            // Get the actual socket object for this ID
            const receiverSocket = connections.get(socketId);

            // If we found the socket, emit the message
            if (receiverSocket) {
              receiverSocket.emit("new-message", {
                ...message,
                status: "received",
              });
            }
          });
        } else {
          console.log(
            `User ${receiverId} is not connected, message will be delivered when they connect`,
          );
          // Optionally store undelivered messages for later delivery
        }
      }
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        socket.emit("message-error", {
          tempId: tempId ?? "",
          message: err.message || "Failed to send message",
          status: "failed",
        });
      }
    }
  }
}
