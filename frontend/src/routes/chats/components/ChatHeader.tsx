import { useNavigate } from "react-router";
import type { Chat } from "@/types/chat-types";
import { Info, MoreVertical, Phone, Video } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  selectedChatData: Chat | undefined;
};

export default function ChatHeader({ selectedChatData }: ChatHeaderProps) {
  const router = useNavigate();
  return (
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
              {(
                selectedChatData?.otherUsers[0]?.customName ??
                selectedChatData?.otherUsers[0]?.firstname ??
                "U"
              )
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedChatData?.otherUsers[0]?.customName ??
                selectedChatData?.otherUsers[0]?.firstname}
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

          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => router("/chats/video-call")}
          >
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
  );
}
