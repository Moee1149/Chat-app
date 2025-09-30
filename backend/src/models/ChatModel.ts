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

  async findChatBetweenUsers(user1Id: string, user2Id: string) {
    try {
      const chat = await prisma.chat.findFirst({
        where: {
          AND: [
            {
              users: {
                some: {
                  id: user1Id,
                },
              },
            },
            {
              users: {
                some: {
                  id: user2Id,
                },
              },
            },
          ],
        },
        include: {
          users: true,
        },
      });

      // Return only if it's a 1-on-1 chat (exactly 2 users)
      return chat && chat.users.length === 2 ? chat : null;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }
}
