import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSearchParams } from "react-router";

import type { Message } from "@/types/message-types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function MessageInput() {
  const [newMessage, setNewMessage] = useState("");
  const { data } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const { socket } = useSocket();

  const chatId = searchParams.get("chatId") as string;
  const senderId = data?.data?.user?.id as string;

  const sendMessageMutation = useMutation({
    mutationFn: async (message: Message) => {
      await axios.post(`${backendUrl}/chat/message`, message);
      // real time connection setup
    },
    onSuccess: () => {
      console.log("Message sent successfully");
      setNewMessage("");
    },
  });

  //handler
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
      socket?.emit("send_message", { text: newMessage, senderId, chatId });
      sendMessageMutation.mutate({ text: newMessage, senderId, chatId });
    }
  };

  // useEffect(() => {
  //   if (socket) {
  //     socket.emit("send_message", { text: "hello", senderId, chatId });
  //   }
  // }, []);

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
