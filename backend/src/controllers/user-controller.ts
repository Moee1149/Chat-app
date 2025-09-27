import type { Request, Response, NextFunction } from "express";

import { UserModel } from "../models/UserModel";
import { ChatModel } from "../models/ChatModel";

import { BadRequest, ConflictError } from "../error";

export class UserController {
  userModel;
  chatModel;
  constructor() {
    this.userModel = new UserModel();
    this.chatModel = new ChatModel();
  }
}
