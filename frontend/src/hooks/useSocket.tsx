import { SocketContext } from "@/context/SocketContext";
import { useContext, useEffect, useState } from "react";

export const useSocket = () => {
  const socket = useContext(SocketContext);
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    //handle connection events
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);
  return { socket, isConnected };
};
