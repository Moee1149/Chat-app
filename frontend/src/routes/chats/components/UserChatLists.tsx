import { ScrollArea } from "@/components/ui/scroll-area";
import SingleChatList, { type Chat } from "./SingleChatList";

const chats: Chat[] = [
  {
    id: "23434",
    user: {
      name: "kshitij",
    },
    latestMessage: {
      text: "hello",
      timestamp: "2025-01-23",
    },
  },
];

export default function UserChatLists() {
  return (
    <ScrollArea className="pb-3 flex-1 overflow-y-auto pr-5">
      <SingleChatList chats={chats} />
    </ScrollArea>
  );
}
