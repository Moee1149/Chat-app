import ChatSideBar from "./components/ChatSideBar";
import LeftSideBar from "./components/LeftSideBar";

export default function ChatLayout() {
  return (
    <div className="min-h-screen overflow-y-hidden">
      <div className="h-screen grid grid-cols-[60px_minmax(400px,_1fr)_3fr]">
        <LeftSideBar />
        <ChatSideBar />
        <main className="bg-black">moee moee</main>
      </div>
    </div>
  );
}
