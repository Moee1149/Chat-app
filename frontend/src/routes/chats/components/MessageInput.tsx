import { useEffect, useId, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { useSocket } from "@/hooks/useSocket";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { Message } from "@/types/message-types";
import type { Chat } from "@/types/chat-types";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MessageType extends Message {
  tempId: string;
}

type MessageInputProps = {
  selectedChatData: Chat | undefined;
};

export default function MessageInput({ selectedChatData }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const { data } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const id = useId();
  const receiverId = selectedChatData?.otherUsers[0]?.id;

  const chatId = searchParams.get("chatId") as string;
  const senderId = data?.data?.user?.id as string;

  //handler
  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    // Create a temporary ID for optimistic updates
    const tempId = `${id}_${Date.now() + Math.random()}`;
    const timestamp = new Date().toISOString();

    // Create message object
    const messageData: Message = {
      id: tempId,
      text: newMessage.trim(),
      senderId,
      chatId,
      createdAt: timestamp,
    };

    // Optimistically update UI
    queryClient.setQueryData(
      ["messages", chatId],
      (oldMessages: Message[] = []) => {
        return [...oldMessages, messageData];
      },
    );

    setNewMessage("");
    socket?.emit("send_message", {
      tempId,
      text: newMessage.trim(),
      senderId,
      chatId,
      receiverId,
      status: "pending",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
