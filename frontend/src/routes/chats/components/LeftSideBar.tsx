import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareText, Settings } from "lucide-react";

export default function LeftSideBar() {
  return (
    <div className="bg-gray-200 px-3 py-2 flex flex-col items-center">
      <div className="flex-1 pt-3 flex flex-col gap-5">
        <MessageSquareText className="fill-gray-100 " size={25} />
      </div>
      <div className="pb-3 flex flex-col items-center gap-4">
        <Settings size={25} />
        <Avatar className="h-10 w-10">
          <AvatarImage src="https://github.com/shadcn.png" sizes="40" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
