import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SingleChatList from "./SingleChatList";

type OldChat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const chats: OldChat[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    lastMessage: "Hey! How are you doing today?",
    time: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
    lastMessage: "The project looks great! 👍",
    time: "1h ago",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
    lastMessage: "Can we schedule a meeting?",
    time: "3h ago",
    unread: 1,
    online: false,
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40&text=AR",
    lastMessage: "Thanks for your help!",
    time: "1d ago",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Lisa Wang",
    avatar: "/placeholder.svg?height=40&width=40&text=LW",
    lastMessage: "See you tomorrow 😊",
    time: "2d ago",
    unread: 0,
    online: true,
  },
];

interface UserChatListsProps {
  selectedChat?: number | null;
  onChatSelect?: (chatId: number) => void;
  searchQuery?: string;
}

export default function UserChatLists({
  selectedChat,
  onChatSelect,
  searchQuery = "",
}: UserChatListsProps) {
  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 mb-3 ${
              selectedChat === chat.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
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
