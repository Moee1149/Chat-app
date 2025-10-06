import { prisma } from "../config/db";
import { DatabaseError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";

export class ChatParticipantModel {
  static async resetUnreadCount(chatId: string, userId: string) {
    try {
      // Reset the unread count
      await prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId: chatId,
            userId: userId,
          },
        },
        data: {
          unreadCount: 0,
          lastReadAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Prisma Error:", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }
}
