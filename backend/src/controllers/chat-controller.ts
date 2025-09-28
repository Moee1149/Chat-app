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
      res.status(200).json(chats);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}
