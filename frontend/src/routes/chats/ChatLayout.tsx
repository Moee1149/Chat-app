import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { Chat } from "@/types/chat-types";

import ChatSideBar from "./components/ChatSideBar";
import NoChatSelected from "./components/NoChatSelected";
import MessageInput from "./components/MessageInput";
import ChatHeader from "./components/ChatHeader";
import MessageArea from "./components/MessageArea";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

async function getAllChats(userId: string): Promise<Chat[]> {
  const response = await axios.get(`${backendUrl}/chat/get_chats/${userId}`);
  return response.data;
}

export default function ChatApp() {
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { data } = useCurrentUser();
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

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);
  console.log(selectedChatData);

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
              <MessageInput />
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
