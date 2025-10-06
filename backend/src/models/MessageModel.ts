import { prisma } from "../config/db";
import { DatabaseError } from "../error";
import { ChatParticipantModel } from "./ChatParticipantModel";

export class MessageModel {
  static async markMessageRead(chatId: string, userId: string) {
    try {
      // Mark the message as read and also add seen at
      await prisma.message.updateMany({
        where: {
          chatId: chatId,
          senderId: { not: userId },
          seen: false,
        },
        data: {
          seen: true,
          seenAt: new Date(),
        },
      });
    } catch (err) {
      console.log("Database Error :", err);
      throw new DatabaseError("Database Error");
    }
  }
}
