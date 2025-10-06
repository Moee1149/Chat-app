import { type Socket } from "socket.io";
import { connections, userSessions } from "../socket";

import { ChatModel } from "../models/ChatModel";
import { ChatParticipantModel } from "../models/ChatParticipantModel";
import { MessageModel } from "../models/MessageModel";
import { DatabaseError } from "../error";

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
      console.log(receiverId);
      const participants = await ChatModel.getChatParticipants(chatId);

      // Send message to all participants except the sender
      const receivers = participants.filter((user) => user.id !== senderId);

      receivers.forEach((receiver) => {
        const receiverSocketIds = userSessions.get(receiver.id);

        if (receiverSocketIds && receiverSocketIds.size > 0) {
          console.log(
            `Sending message to ${receiver.id} on ${receiverSocketIds.size} sockets`,
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
            `User ${receiver.id} is not connected, message will be delivered when they connect`,
          );
          // Optionally store undelivered messages for later delivery
        }
      });
    } catch (err) {
      console.log(err);
      if (err instanceof DatabaseError) {
        socket.emit("message-error", {
          tempId: tempId ?? "",
          message: err.message || "Failed to send message",
          status: "failed",
        });
      }
    }
  }

  static async markMessageRead(socket: Socket, chatId: string, userId: string) {
    try {
      // Validate input
      if (!chatId || !userId) {
        socket.emit("mark-messages-read-error", {
          message: "Missing required fields: chatId or userId",
          status: "error",
        });
        return;
      }

      await MessageModel.markMessageRead(chatId, userId);
      await ChatParticipantModel.resetUnreadCount(chatId, userId);
      socket.emit("mark-messages-read-success", {
        chatId,
        userId,
        status: "success",
      });
      console.log("marked messsage as read");
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        // Emit error event back to client
        socket.emit("mark-messages-read-error", {
          message: "Failed to mark messages as read",
          status: "error",
          details:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }
  }
}
