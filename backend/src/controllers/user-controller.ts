import type { Request, Response, NextFunction } from "express";

import { UserModel } from "../models/UserModel";
import { ChatModel } from "../models/ChatModel";
import { JWTPayload, verifyToken } from "../helper/jwt";
import { type Server, type Socket } from "socket.io";
import { userSessions } from "../socket";

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

  static async handleUpdateOnlineStatus(
    socket: Socket,
    userId: string,
    status: boolean,
    io: Server,
  ) {
    try {
      console.log(`🔄 Updating user ${userId} online status to: ${status}`);

      // ✅ Update last seen when going offline
      if (status === false) {
        await UserModel.updateLastSeen(userId);
      }

      // ✅ Update user's online status in database
      const user = await UserModel.updateOnlineStatus(userId, status);
      console.log(`✅ User ${userId} status updated in DB:`, {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      });

      // ✅ Get user's contacts using the corrected method
      const userContacts = await ChatModel.getUserContactsWithDetails(userId);
      console.log(
        `📞 Found ${userContacts.length} contacts to notify:`,
        userContacts,
      );

      // ✅ Prepare status update data
      const statusUpdate = {
        userId: userId,
        isOnline: status,
        lastSeen: user.lastSeen || new Date().toISOString(),
      };

      let broadcastCount = 0;

      // ✅ Broadcast to each contact who is currently connected
      for (const contact of userContacts) {
        // Changed from contactId to contact
        console.log(`📡 Checking if contact ${contact.id} is online...`); // Use contact.id

        // Check if contact has active sessions
        if (userSessions.has(contact.id)) {
          // Use contact.id
          const contactSocketIds = userSessions.get(contact.id); // Use contact.id
          console.log(
            `👤 Contact ${contact.id} has ${contactSocketIds?.size} active sessions`, // Use contact.id
          );

          // Emit to all of contact's active sessions
          contactSocketIds?.forEach((socketId) => {
            const contactSocket = io.sockets.sockets.get(socketId);
            if (contactSocket) {
              console.log(`📤 Emitting status update to socket ${socketId}`);
              contactSocket.emit("user-status-update", statusUpdate);
              broadcastCount++;
            } else {
              console.log(`⚠️ Socket ${socketId} not found in server`);
            }
          });
        } else {
          console.log(`📴 Contact ${contact.id} is not currently connected`); // Use contact.id
        }
      }

      console.log(
        `📡 Status update broadcasted to ${broadcastCount} active sessions`,
      );

      // ✅ Also emit back to the user for confirmation
      socket.emit("user-status-update", statusUpdate);
      console.log(`✅ Status update completed for user ${userId}`);
    } catch (error) {
      console.error("❌ Error updating online status:", error);
    }
  }
}
