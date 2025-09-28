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
      const chats = await prisma.chat.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
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
        },
      });

      // Transform the data to include custom names
      const chatsWithCustomNames = chats.map((chat) => {
        const otherUsers = chat.users.filter((user) => user.id !== userId);

        const usersWithCustomNames = otherUsers.map((user) => {
          const customContact = user.asContacts.find(
            (contact) => contact.FirstName && contact.LastName,
          );

          return {
            id: user.id,
            email: user.email,
            firstname: customContact?.FirstName || user.firstname,
            lastname: customContact?.LastName || user.lastname,
            bio: user.bio,
            isOnline: user.isOnline,
            profilePictureUrl: user.profilePictureUrl,
            customName: customContact
              ? `${customContact.FirstName} ${customContact.LastName}`
              : null,
          };
        });

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          otherUsers: usersWithCustomNames,
        };
      });

      return chatsWithCustomNames;
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
