import { Router } from "express";

import { ChatController } from "../controllers/chat-controller";

const router = Router();

const chatController = new ChatController();

//post routes
router.post("/add_chat", chatController.handleAddNewChat.bind(chatController));
router.post(
  "/message",
  chatController.handleAddNewMessage.bind(chatController),
);

//get routes
router.get(
  "/get_chats/:userId",
  chatController.handleGetAllChatForUser.bind(chatController),
);
router.get(
  "/message/:chatId",
  chatController.handleGetAllMessageByChat.bind(chatController),
);

export default router;
