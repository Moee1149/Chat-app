import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export default function ChatSearchBar() {
  return (
    <div className="mr-4 relative flex items-center mt-2 p-2">
      <Search className="absolute left-4" size={20} />
      <Input
        placeholder="Search or start a new chat"
        className="pl-10  focus:outline-blue-500"
      />
      <X className="absolute right-5 cursor-pointer" size={20} />
    </div>
  );
}
