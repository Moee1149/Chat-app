import { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  MessageCircle,
  Sun,
  Moon,
  MoreVertical,
  Phone,
  Video,
  Info,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddNewUserDialog from "./components/AddNewUser";

// Dummy data
const chats = [
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

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);
  const chatMessages = selectedChat
    ? messages[selectedChat as keyof typeof messages] || []
    : [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, you'd send this to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className={`h-screen flex ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Left Sidebar */}
        <div className="w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                ChatWave
              </h1>
              <div className="space-x-3">
                <Dialog>
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
                  <AddNewUserDialog />
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Chat List */}
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
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage
                          src={chat.avatar || "/placeholder.svg"}
                          alt={chat.name}
                        />
                        <AvatarFallback className="dark:bg-[#EAEAEA]">
                          {chat.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {chat.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full ml-2">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedChatData?.avatar || "/placeholder.svg"}
                        alt={selectedChatData?.name}
                      />
                      <AvatarFallback className="dark:bg-[#EAEAEA]">
                        {selectedChatData?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedChatData?.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedChatData?.online
                          ? "Online"
                          : "Last seen recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
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

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === "me"
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "me"
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
            </>
          ) : (
            /* Default State */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div>
                  <MessageCircle className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select a chat to start messaging
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
