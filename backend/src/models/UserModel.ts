import { prisma } from "../config/db";

import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";
import { DatabaseError } from "../error";

export class UserModel {
  //update online status
  static async updateOnlineStatus(userId: string, status: boolean) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { isOnline: status },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }

  static async updateLastSeen(userId: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }

  //check user exist method
  async checkUserExist(email: string) {
    try {
      return await prisma.user.findFirst({ where: { email } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }

  //check find user by number
  async findUserByPhone(phone: string) {
    try {
      const user = prisma.user.findMany({ where: { mobile_number: phone } });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }
}
