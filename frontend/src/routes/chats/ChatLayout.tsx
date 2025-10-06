import { useState, useEffect, useRef, useCallback } from "react";
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
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Use refs to avoid stale closures
  const selectedChatRef = useRef<string | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);

  // Update refs when values change
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // get all chat
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["chats", userId],
    queryFn: () => getAllChats(userId),
    enabled: !!userId,
  });

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  // Helper function to get chat by ID from current chats
  const getChatById = useCallback(
    (chatId: string): Chat | undefined => {
      const currentChats =
        queryClient.getQueryData<Chat[]>(["chats", userIdRef.current]) || [];
      return currentChats.find((chat) => chat.id === chatId);
    },
    [queryClient],
  );

  // Helper function to show message toast
  const showMessageToast = (message: Message, chat: Chat) => {
    const otherUser = chat.otherUsers?.[0];
    if (!otherUser) return;

    toast(
      <div className="flex items-center justify-center">
        <Avatar className="flex-shrink-0 h-10 w-10">
          <AvatarImage src={otherUser.profilePictureUrl} />
          <AvatarFallback>
            {otherUser.customName?.[0] ?? otherUser.firstname?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <div className="font-bold text-md">
            {otherUser.customName ?? otherUser.firstname}
          </div>
          <div className="text-sm text-gray-600 truncate max-w-[200px]">
            {message.text}
          </div>
        </div>
      </div>,
      {
        position: "top-center",
      },
    );
  };

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

    const handleMessageAck = (message: MessageType) => {
      const currentSelectedChat = selectedChatRef?.current;
      if (!currentSelectedChat) return;

      queryClient.setQueryData(
        ["messages", currentSelectedChat],
        (oldMessages: Message[] = []) => {
          return oldMessages.map((msg) =>
            msg.id === message.tempId ? message : msg,
          );
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chats", userIdRef.current] });
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
      const currentSelectedChat = selectedChatRef.current;
      if (!currentSelectedChat) return;
      queryClient.setQueryData(
        ["messages", currentSelectedChat],
        (oldMessages: Message[] = []) =>
          oldMessages.map((m) =>
            m.id === tempId ? { ...m, status, message } : m,
          ),
      );
    };

    socket.on("message-ack", handleMessageAck);
    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("message-ack", handleMessageAck);
      socket.off("message-error", handleMessageError);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    if (!socket) return;
    console.log("Use Effect runs:");

    const handleNewMessage = (message: Message) => {
      console.log("New message received: ", message);
      const currentSelectedChat = selectedChatRef?.current;
      const currentUserId = userIdRef?.current;
      // ✅ Check userId here instead of in the condition above
      if (!currentUserId) {
        console.log("No userId available, skipping message processing");
        return;
      }

      const targetChat = getChatById(message.chatId);
      console.log("Target chat found: ", targetChat);
      console.log("message.chatid:", message.chatId);
      console.log("currestselected: ", currentSelectedChat);
      console.log("currentuserId:", currentUserId);

      if (message.chatId === currentSelectedChat) {
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

        // ✅ Comprehensive optimistic update
        queryClient.setQueryData(
          ["chats", currentUserId],
          (oldChats: Chat[] = []) => {
            const updatedChats = oldChats.map((chat) => {
              if (chat.id === message.chatId) {
                return {
                  ...chat,
                  unreadCount: 0, // Optimistically set to 0
                  lastMessage: message.text,
                  lastMessageAt: message.createdAt || new Date().toISOString(),
                };
              }
              return chat;
            });

            // Move updated chat to top
            const targetChatIndex = updatedChats.findIndex(
              (chat) => chat.id === message.chatId,
            );
            if (targetChatIndex > 0) {
              const [targetChatObj] = updatedChats.splice(targetChatIndex, 1);
              updatedChats.unshift(targetChatObj);
            }

            return updatedChats;
          },
        );

        //mark message as read for current user
        socket.emit("mark-message-read", {
          chatId: message.chatId,
          userId: currentUserId,
        });
        console.log("Target chat other users: ", targetChat?.otherUsers[0]);
      } else {
        queryClient.setQueryData(
          ["chats", currentUserId],
          (oldChats: Chat[] = []) => {
            return oldChats.map((chat) =>
              chat.id === message.chatId
                ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
                : chat,
            );
          },
        );
        // ✅ Invalidate queries to trigger UI update
        queryClient.invalidateQueries({ queryKey: ["chats", currentUserId] });
      }
      if (targetChat?.otherUsers[0]) {
        showMessageToast(message, targetChat);
      }
    };

    // Error handler for mark-messages-read operation
    const handleMarkMessagesReadError = (error: {
      message: string;
      status: string;
      detail?: string;
    }) => {
      // Show toast notification or handle error
      toast.error(`Failed to mark messages as read: ${error.message}`);

      // Optionally retry or take other recovery actions
      console.error("Error marking messages as read:", error);
    };

    // ✅ Handle server confirmation for mark-as-read success
    const handleMarkAsReadSuccess = (data: {
      chatId: string;
      userId: string;
    }) => {
      console.log("Server confirmed mark-as-read success:", data);

      // ✅ Now it's safe to invalidate and get fresh server data
      queryClient.invalidateQueries({ queryKey: ["chats", data.userId] });
    };

    socket.on("new-message", handleNewMessage);
    socket.on("mark-message-read-error", handleMarkMessagesReadError);
    socket.on("mark-message-read-success", handleMarkAsReadSuccess);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("mark-message-read-error", handleMarkMessagesReadError);
      socket.off("mark-message-read-success", handleMarkAsReadSuccess);
    };
  }, [socket, queryClient, getChatById]);

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
