import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Chat = {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  latestMessage: {
    text: string;
    timestamp: string;
  };
  unreadCount?: number;
};

interface Props {
  chats: Chat[];
}

export default function SingleChatList({ chats }: Props) {
  if (chats.length < 1) {
    return <div>No Chat Found</div>;
  }

  return (
    <>
      {chats.map((chat) => {
        return (
          <div
            className="flex items-center gap-4 p-3 mt-3 hover:bg-gray-300/70 hover:shadow-sm  hover:rounded-md transition-all cursor-pointer"
            key={chat.id}
          >
            <div className="flex items-center justify-center p-6 bg-gray-300/60 rounded-full h-15 w-15">
              <Avatar>
                <AvatarImage src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl capitalize">
                  {chat.user.name}
                </h3>
                <span className="text-zinc-500/80 font-medium">
                  {chat.latestMessage.timestamp}
                </span>
              </div>
              <p className="text-zinc-500/80 font-medium">
                {chat.latestMessage.text}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}
