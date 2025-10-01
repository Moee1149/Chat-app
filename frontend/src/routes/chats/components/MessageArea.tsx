import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "react-router";
import axios from "axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

type Message = {
  id: string;
  text: string;
  senderId: string; // User ID of sender
  fileUrl: string | null;
  chatId: string;
  seen: boolean;
  delivered: boolean;
  createdAt: string; // This will be ISO string in frontend
};

async function getAllMessages(chatId: string) {
  const response = await axios.get(`${backendUrl}/chat/message/${chatId}`);
  return response.data;
}

// Helper function to format time from ISO string
const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function MessageArea() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data } = useCurrentUser();
  const senderId = data?.data?.user?.id;

  const { data: chatMessages = [] } = useQuery<Message[]>({
    queryKey: ["messages", chatId],
    queryFn: () => getAllMessages(chatId!),
    enabled: !!chatId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4">
        {chatMessages.length > 0 ? (
          chatMessages.map((message) => {
            // Determine if this message is from the current user
            const isCurrentUser = message.senderId === senderId;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.fileUrl && (
                      <div className="mt-2">
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          View attachment
                        </a>
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 text-gray-500 ${
                      isCurrentUser ? "text-right" : "dark:text-gray-400 ml-2"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {chatId ? "No messages yet" : "Select a chat to see messages"}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
