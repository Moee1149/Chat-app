import ChatSearchBar from "./ChatSearchBar";
import UserChatLists from "./UserChatLists";
import { useState } from "react";

import { Sun, Moon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddNewUserDialog from "./AddNewUser";
import type { Chat } from "@/types/chat-types";
import { useSearchParams } from "react-router";

interface ChatSideBarProps {
  chats: Chat[];
  selectedChat: string | null;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function ChatSideBar({
  chats,
  selectedChat,
  isDarkMode,
  setIsDarkMode,
}: ChatSideBarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setSearchParams] = useSearchParams();

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleChatSelect = (chatId: string) => {
    setSearchParams({ chatId });
  };

  return (
    <div className="w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            ChatWave
          </h1>
          <div className="space-x-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  <Plus
                    className="fill-gray-100 cursor-pointer hover:stroke-gray-600"
                    size={20}
                  />
                </Button>
              </DialogTrigger>
              <AddNewUserDialog onClose={closeDialog} />
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <ChatSearchBar onSearchChange={handleSearchChange} />
      </div>

      {/* Chat List */}
      <UserChatLists
        chats={chats}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
}
