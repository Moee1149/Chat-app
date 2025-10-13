import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";

const VideoCall = () => {
  const { socket } = useSocket();
  useEffect(() => {
    const lc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
    });

    const dc = lc.createDataChannel("channel");
    dc.onmessage = (e) => console.log("just got a message ", e.data);
    dc.onopen = () => console.log("Connection Open");
    lc.onicecandidate = (e) => {
      if (e.candidate) {
        socket?.emit("ice-candidate", {
          type: "ice-candidate",
          candidate: e.candidate,
        });
      }
    };
    lc.ontrack = (e) => {
      console.log("Received remote track: ", e.streams[0]);
    };

    return () => {
      dc.close();
      lc.close();
    };
  }, [socket]);

  return <div>Hello</div>;
};

export default VideoCall;
