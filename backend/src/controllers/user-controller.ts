import type { Request, Response, NextFunction } from "express";

import { UserModel } from "../models/UserModel";
import { ChatModel } from "../models/ChatModel";
import { JWTPayload, verifyToken } from "../helper/jwt";

export class UserController {
  userModel;
  chatModel;
  constructor() {
    this.userModel = new UserModel();
    this.chatModel = new ChatModel();
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
      }

      const decoded = verifyToken(token) as JWTPayload;
      res.json({ user: decoded });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  }
}
