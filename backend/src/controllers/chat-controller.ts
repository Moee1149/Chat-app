import { NextFunction, Request, Response } from "express";

import { BadRequest } from "../error";
import { ChatModel } from "../models/ChatModel";
import { UserContactModel } from "../models/UserContactModel";

export class ChatController {
  private chatModel;
  private userContactModel;
  constructor() {
    this.chatModel = new ChatModel();
    this.userContactModel = new UserContactModel();
  }

  async handleAddNewChat(req: Request, res: Response, next: NextFunction) {
    const { senderId, receiverId, firstName, lastName } = req.body;
    try {
      if (!senderId || !receiverId || !firstName || !lastName) {
        throw new BadRequest("All fields are required");
      }

      // Check if chat already exists
      const existingChat = await this.chatModel.findChatBetweenUsers(
        senderId,
        receiverId,
      );

      if (existingChat) {
        return res.status(200).json({
          chat: existingChat,
          message: "Chat already exists",
          isCreated: false,
        });
      }

      // Create new chat
      const newChat = await this.chatModel.addNewChat(senderId, receiverId);

      const userContact = await this.userContactModel.addNewContact(
        senderId,
        receiverId,
        firstName,
        lastName,
      );

      res.status(201).json({
        chat: newChat,
        userContact,
        message: "New chat created",
        isCreated: true,
      });
    } catch (error) {
      console.error("Error in handleAddNewChat:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      next(error);
    }
  }

  async handleGetAllChatForUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { userId } = req.params;
    if (!userId) {
      throw new BadRequest("User ID is required");
    }
    try {
      const chats = await this.chatModel.getAllChatForUser(userId);
      // Transform the data to include custom names, last message, and unread counts
      const chatsWithDetails = chats.map((chat) => {
        const otherUsers = chat.users.filter((user) => user.id !== userId);
        const userParticipant = chat.chatParticipants[0]; // Current user's participant record

        const usersWithCustomNames = otherUsers.map((user) => {
          const customContact = user.asContacts.find(
            (contact) => contact.FirstName && contact.LastName,
          );

          return {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            bio: user.bio,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            profilePictureUrl: user.profilePictureUrl,
            customName: customContact
              ? `${customContact.FirstName} ${customContact.LastName}`
              : null,
          };
        });

        return {
          id: chat.id,
          lastMessage: chat.lastMessage || "",
          lastMessageAt: chat.lastMessageAt,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          unreadCount: userParticipant?.unreadCount || 0,
          otherUsers: usersWithCustomNames,
        };
      });
      res.status(200).json(chatsWithDetails);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async handleGetAllMessageByChat(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { chatId } = req.params;
      console.log(chatId);
      const messages = await this.chatModel.getMessagesByChatId(chatId);
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}
