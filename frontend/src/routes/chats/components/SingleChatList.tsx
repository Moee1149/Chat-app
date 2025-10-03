import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat } from "@/types/chat-types";
import { formatRecentTime } from "@/utils/dateUtils";

// For single chat display
export interface SingleChatListProps {
  chat: Chat;
  selected?: boolean;
}

export default function SingleChatList({ chat }: SingleChatListProps) {
  const timeDisplay = formatRecentTime(chat.lastMessageAt);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Avatar className="h-14 w-14">
          <AvatarImage
            src={chat.otherUsers[0]?.profilePictureUrl || "/placeholder.svg"}
            alt={
              chat.otherUsers[0]?.customName ?? chat.otherUsers[0]?.firstname
            }
          />
          <AvatarFallback className="dark:bg-[#EAEAEA]">
            {(
              chat.otherUsers[0]?.customName ??
              chat.otherUsers[0]?.firstname ??
              "U"
            )
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        {chat.otherUsers[0]?.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {chat.otherUsers[0]?.customName ?? chat.otherUsers[0]?.firstname}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeDisplay}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {chat.lastMessage}
          </p>
          {chat.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full ml-2">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
