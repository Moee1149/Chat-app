import type { Request, Response, NextFunction } from "express";

import { UserModel } from "../models/UserModel";
import { BadRequest, ConflictError } from "../error";

export class UserController {
  userModel;
  constructor() {
    this.userModel = new UserModel();
  }

  async checkUserExists(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    try {
      if (!email) {
        throw new BadRequest("Email is required");
      }
      const user = await this.userModel.checkUserExist(email);
      if (user) {
        throw new ConflictError("User already exits with this email");
      }
      res.status(200).json({ message: "User is available" });
    } catch (error) {
      next(error);
    }
  }

  async handleFindUser(req: Request, res: Response, next: NextFunction) {
    const { phone } = req.body;
    try {
      if (!phone) {
        throw new BadRequest("phone number is required");
      }
      const user = await this.userModel.findUserByPhone(phone);
      if (user.length < 1) {
        res.status(200).json({ message: "No user Found" });
        return;
      }
      console.log(user);
      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
