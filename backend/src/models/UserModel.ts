import { prisma } from "../config/db";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";
import { DatabaseError } from "../error";

export class UserModel {
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
      return await prisma.user.findMany({ where: { mobile_number: phone } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log("Primsa Error: ", error.code);
        throw new DatabaseError("Database error: " + error.code);
      }
      throw error;
    }
  }
}
