import { MessageCircle } from "lucide-react";

export default function NoChatSelected() {
  return (
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
  );
}
