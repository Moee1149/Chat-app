import { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  MoreVertical,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatSideBar from "./components/ChatSideBar";
import { useSearchParams } from "react-router";
import type { Chat } from "@/types/chat-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const messages = {
  1: [
    {
      id: 1,
      text: "Hey! How are you doing today?",
      sender: "other",
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "I'm doing great, thanks for asking! How about you?",
      sender: "me",
      time: "10:32 AM",
    },
    {
      id: 3,
      text: "Pretty good! Just working on some new projects",
      sender: "other",
      time: "10:35 AM",
    },
    {
      id: 4,
      text: "That sounds exciting! What kind of projects?",
      sender: "me",
      time: "10:36 AM",
    },
    {
      id: 5,
      text: "Mostly web development stuff. Building some cool React apps",
      sender: "other",
      time: "10:38 AM",
    },
  ],
  2: [
    {
      id: 1,
      text: "The project looks great! 👍",
      sender: "other",
      time: "9:15 AM",
    },
    {
      id: 2,
      text: "Thank you! I put a lot of effort into it",
      sender: "me",
      time: "9:20 AM",
    },
    {
      id: 3,
      text: "It really shows. The design is very clean",
      sender: "other",
      time: "9:22 AM",
    },
  ],
  3: [
    {
      id: 1,
      text: "Can we schedule a meeting?",
      sender: "other",
      time: "7:45 AM",
    },
    { id: 2, text: "What time works for you?", sender: "me", time: "8:00 AM" },
  ],
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

async function getAllChats(userId: string): Promise<Chat[]> {
  const response = await axios.get(`${backendUrl}/chat/get_chats/${userId}`);
  return response.data;
}

export default function ChatApp() {
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data } = useCurrentUser();
  const userId = data?.data?.user?.id;

  // get all chat
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["chats", userId],
    queryFn: () => getAllChats(userId),
    enabled: !!userId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  useEffect(() => {
    function getChatId() {
      const chatId = searchParams.get("chatId");
      return chatId ? chatId : null;
    }
    const chatId = getChatId();
    setSelectedChat(chatId);
  }, [searchParams]);

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);
  const chatMessages = selectedChat
    ? messages[selectedChat as keyof typeof messages] || []
    : [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, you'd send this to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

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
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedChatData?.otherUsers[0]?.profilePictureUrl ||
                          "/placeholder.svg"
                        }
                        alt={selectedChatData?.otherUsers[0]?.customName}
                      />
                      <AvatarFallback className="dark:bg-[#EAEAEA]">
                        {selectedChatData?.otherUsers[0]?.customName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedChatData?.otherUsers[0]?.customName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedChatData?.otherUsers[0]?.isOnline
                          ? "Online"
                          : "Last seen recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === "me"
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "me"
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
            </>
          ) : (
            /* Default State */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div>
                  <MessageCircle className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select a chat to start messaging
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
