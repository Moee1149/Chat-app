import { Router } from "express";

import { ChatController } from "../controllers/chat-controller";

const router = Router();

const chatController = new ChatController();

router.post("/add_chat", chatController.handleAddNewChat.bind(chatController));
router.get(
  "/get_chats/:userId",
  chatController.handleGetAllChatForUser.bind(chatController),
);

export default router;
