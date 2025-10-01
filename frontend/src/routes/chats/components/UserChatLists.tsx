import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SingleChatList from "./SingleChatList";
import type { Chat } from "@/types/chat-types";

// For your UserChatLists.tsx component props
export interface UserChatListsProps {
  chats: Chat[];
  selectedChat?: string | null;
  onChatSelect?: (chatId: string) => void;
  searchQuery?: string;
}

export default function UserChatLists({
  chats,
  selectedChat,
  onChatSelect,
  searchQuery = "",
}: UserChatListsProps) {
  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.otherUsers[0].customName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [chats, searchQuery]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 rounded-xl cursor-pointer transition-colors duration-200 mb-2 ${
              selectedChat === chat.id
                ? "bg-blue-50 dark:bg-blue-900/20  border-blue-500"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => onChatSelect?.(chat.id)}
          >
            <SingleChatList chat={chat} />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
