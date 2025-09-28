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
      const user = await this.chatModel.addNewChat(senderId, receiverId);
      const userContact = await this.userContactModel.addNewContact(
        senderId,
        receiverId,
        firstName,
        lastName,
      );
      res.status(201).json({ user, userContact });
    } catch (error) {
      next(error);
    }
  }
}
