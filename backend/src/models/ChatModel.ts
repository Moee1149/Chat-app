import { prisma } from "../config/db";
import { DatabaseError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";

export class ChatModel {
  async addNewChat(senderId: string, reciverId: string) {
    try {
      const newChat = await prisma.chat.create({
        data: {
          users: {
            connect: [{ id: senderId }, { id: reciverId }],
          },
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
}
