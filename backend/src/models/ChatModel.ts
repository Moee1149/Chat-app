import { prisma } from "../config/db";
import { DatabaseError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";

export type Message = {
  id?: string;
  text: string;
  senderId: string; // User ID of sender
  fileUrl?: string;
  chatId: string;
  seen?: boolean;
  delivered?: boolean;
  createdAt?: string; // This will be ISO string in frontend
};

export class ChatModel {
  async addNewChat(senderId: string, reciverId: string) {
    try {
      const newChat = await prisma.chat.create({
        data: {
          users: {
            connect: [{ id: senderId }, { id: reciverId }],
          },
        },
        include: {
          users: true,
        },
      });
      return newChat;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }

  async getAllChatForUser(userId: string) {
    try {
      // Get all chats for the user, including chat participants for unread count
      const chats = await prisma.chat.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          // Include users to get their details
          users: {
            include: {
              asContacts: {
                where: {
                  ownerId: userId,
                },
                select: {
                  FirstName: true,
                  LastName: true,
                },
              },
            },
          },
          // Include chatParticipants to get unread count
          chatParticipants: {
            where: {
              userId: userId, // Get only this user's participant record
            },
          },
        },
        orderBy: {
          // Sort by last message time (most recent first)
          updatedAt: "desc",
        },
      });

      return chats;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }

  async getMessagesByChatId(chatId: string) {
    try {
      const messages = await prisma.message.findMany({
        where: {
          chatId: chatId,
        },
        orderBy: {
          createdAt: "asc", // Order messages from oldest to newest
        },
      });
      return messages;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Prisma Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }

  static async saveMessage(msg: Message) {
    try {
      const message = await prisma.$transaction(async (tx) => {
        // Create the message
        const newMessage = await tx.message.create({
          data: {
            text: msg.text,
            senderId: msg.senderId,
            chatId: msg.chatId,
            fileUrl: msg.fileUrl || "",
            delivered: true,
          },
        });

        // Update the chat's last message and time
        await tx.chat.update({
          where: { id: msg.chatId },
          data: {
            lastMessage: msg.text,
            lastMessageAt: new Date(),
          },
        });

        // Increment unread count for all other participants
        await tx.chatParticipant.updateMany({
          where: {
            chatId: msg.chatId,
            userId: {
              not: msg.senderId,
            },
          },
          data: {
            unreadCount: { increment: 1 },
          },
        });

        return newMessage;
      });

      return message;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Prisma Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }
}
