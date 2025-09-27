import { prisma } from "../config/db";
import { DatabaseError } from "../error";

export class UserContactModel {
  async addNewContact(
    senderId: string,
    reciverId: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      return await prisma.userContact.create({
        data: {
          ownerId: senderId,
          contactId: reciverId,
          FirstName: firstName,
          LastName: lastName,
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to add new contact");
    }
  }
}
