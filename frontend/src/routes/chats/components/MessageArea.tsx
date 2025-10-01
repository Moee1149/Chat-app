import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { Message } from "@/types/message-types";

import { ScrollArea } from "@/components/ui/scroll-area";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
