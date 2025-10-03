import { createContext, useEffect } from "react";
import io, { type Socket } from "socket.io-client";

type SocketContextType = Socket | null;

const socket: Socket = io("http://localhost:5000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log("socket connected");
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
