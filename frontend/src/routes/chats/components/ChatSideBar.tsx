import ChatSearchBar from "./ChatSearchBar";
import UserChatLists from "./UserChatLists";

import { EllipsisVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatSideBar() {
  return (
    <aside className="h-screen bg-gray-100 py-2 pl-3 flex flex-col">
      <div>
        <div className="px-3 py-2 flex justify-between items-center">
          <h2 className="text-2xl font-bold">ChatWave</h2>
          <div className="flex gap-3 items-center">
            <Button size="sm" className="cursor-pointer">
              <Plus
                className="fill-gray-100 cursor-pointer hover:stroke-gray-600"
                size={20}
              />
            </Button>
            <EllipsisVertical size={20} className="cursor-pointer " />
          </div>
        </div>
        {/* search bar */}
        <ChatSearchBar />
      </div>
      <UserChatLists />
    </aside>
  );
}
