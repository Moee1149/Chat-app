import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import axios from "axios";

import { useSocket } from "@/hooks/useSocket";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { Chat } from "@/types/chat-types";
import type { Message } from "@/types/message-types";

import ChatSideBar from "./components/ChatSideBar";
import NoChatSelected from "./components/NoChatSelected";
import MessageInput from "./components/MessageInput";
import ChatHeader from "./components/ChatHeader";
import MessageArea from "./components/MessageArea";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface MessageType extends Message {
  tempId: string;
}

async function getAllChats(userId: string): Promise<Chat[]> {
  const response = await axios.get(`${backendUrl}/chat/get_chats/${userId}`);
  return response.data;
}

export default function ChatApp() {
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { data } = useCurrentUser();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const userId = data?.data?.user?.id;

  // get all chat
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["chats", userId],
    queryFn: () => getAllChats(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    function getChatId() {
      const chatId = searchParams.get("chatId");
      return chatId ? chatId : null;
    }
    const chatId = getChatId();
    setSelectedChat(chatId);
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);

      // Make sure we only process messages for the current chat
      if (message.chatId === selectedChat) {
        queryClient.setQueryData(
          ["messages", message.chatId],
          (oldMessages: Message[] = []) => {
            // Check if message already exists to avoid duplicates
            if (oldMessages?.some((msg) => msg.id === message.id)) {
              return oldMessages;
            }
            return [...oldMessages, message];
          },
        );

        // You could also play a notification sound here
        // Or update unread counts for other chats
      } else {
        // Handle messages for other chats
        // Update unread counts, show notifications, etc.
      }

      queryClient.invalidateQueries({ queryKey: ["chats", userId] });
    };

    const handleMessageAck = (message: MessageType) => {
      queryClient.setQueryData(
        ["messages", selectedChat],
        (oldMessages: Message[] = []) => {
          return oldMessages.map((msg) =>
            msg.id === message.tempId ? message : msg,
          );
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chats", userId] });
    };

    const handleMessageError = ({
      tempId,
      message,
      status = "failed",
    }: {
      tempId: string;
      message: string;
      status: string;
    }) => {
      queryClient.setQueryData(
        ["messages", selectedChat],
        (oldMessages: Message[] = []) =>
          oldMessages.map((m) =>
            m.id === tempId ? { ...m, status, message } : m,
          ),
      );
    };

    socket.on("message-ack", handleMessageAck);
    socket.on("message-error", handleMessageError);
    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("message-ack", handleMessageAck);
      socket.off("message-error", handleMessageError);
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedChat, queryClient, userId]);

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  return (
    <div className={`h-screen flex ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Left Sidebar */}
        <ChatSideBar
          chats={chats}
          selectedChat={selectedChat}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <ChatHeader selectedChatData={selectedChatData} />

              {/* Messages Area */}
              <MessageArea />

              {/* Message Input */}
              <MessageInput selectedChatData={selectedChatData} />
            </>
          ) : (
            /* Default State */
            <NoChatSelected />
          )}
        </div>
      </div>
    </div>
  );
}
