import { SocketContext } from "@/context/SocketContext";
import { useContext, useEffect, useRef, useState } from "react";
import { useCurrentUser } from "./useCurrentUser";

export const useSocket = () => {
  const socket = useContext(SocketContext);
  const { data } = useCurrentUser();
  const userId = data?.data?.user?.id;
  const userIdRef = useRef<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    //handle connection events
    if (!socket) return;

    const onConnect = () => {
      console.log("socket connected");
      setIsConnected(true);
      socket.emit("user-online", userIdRef.current);
    };

    const onDisconnect = () => {
      console.log("socket disconnected");
      setIsConnected(false);
      // ✅ Emit user offline status
      socket.emit("user-offline", userIdRef.current);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);
  return { socket, isConnected };
};
