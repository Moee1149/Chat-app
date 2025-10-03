import { createContext, useEffect } from "react";
import io, { type Socket } from "socket.io-client";

type SocketContextType = Socket | null;

const socket: Socket = io("http://localhost:5000");

export const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("user_connected", localStorage.getItem("userId"));
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
