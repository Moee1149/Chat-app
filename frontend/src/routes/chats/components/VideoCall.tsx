import { useState, useEffect, useRef } from "react";

import { useSocket } from "@/hooks/useSocket";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

type callState = "calling" | "incoming" | "active" | "ended";

const VideoCall = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callState, setCallState] = useState<callState>("incoming");
  const connection = useRef<RTCPeerConnection | null>(null);

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
    connection.current = lc;

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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    lc.ondatachannel = (e) => {
      const receiveChannel = e.channel;
      receiveChannel.onopen = () => {
        console.log("Receiver: Data channel is open");
      };
      receiveChannel.onmessage = (e) => {
        console.log("Receiver got message:", e.data);
      };
    };

    return () => {
      dc.close();
      lc.close();
    };
  }, [socket]);

  useEffect(() => {
    const videoElement = localVideoRef.current;
    // Request access to camera and microphone
    const startLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoElement) {
          videoElement.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          connection.current?.addTrack(track, stream);
        });
      } catch (error) {
        console.error("[v0] Error accessing media devices:", error);
      }
    };

    if (callState == "calling") {
      startLocalVideo();
    }

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callState]);

  const acceptCall = () => {
    setCallState("active");
  };

  const rejectCall = () => {
    navigate("/chats");
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCallState("ended");
  };

  // const startCall = () => {
  //   setCallState("calling");
  // };

  // if (!isCallActive) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-muted">
  //       <div className="text-center">
  //         <h2 className="mb-4 text-2xl font-semibold text-foreground">
  //           Call Ended
  //         </h2>
  //         <Button onClick={startCall} size="lg" className="gap-2">
  //           <Phone className="h-5 w-5" />
  //           Start New Call
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }
  if (callState === "calling") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute right-6 top-6 h-70 w-90 overflow-hidden rounded-lg border-2 border-white/20 shadow-2xl z-50">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <span className="text-xl font-bold text-primary-foreground">
                    You
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="text-center space-y-8">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm animate-pulse">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
              <span className="text-4xl font-bold text-indigo-600">JD</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">
              Calling John Doe...
            </h2>
            <p className="text-blue-100">Waiting for answer</p>
          </div>

          <Button
            onClick={endCall}
            variant="destructive"
            size="lg"
            className="h-16 w-16 rounded-full bg-red-600 p-0 hover:bg-red-700"
          >
            <PhoneOff className="h-7 w-7" />
          </Button>
        </div>
      </div>
    );
  }

  if (callState === "incoming") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="text-center space-y-8">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm animate-bounce">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
              <span className="text-4xl font-bold text-green-600">JD</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">John Doe</h2>
            <p className="text-green-100 text-xl">Incoming video call...</p>
          </div>

          <div className="flex gap-6 justify-center">
            <Button
              onClick={rejectCall}
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full bg-red-600 p-0 hover:bg-red-700"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>

            <Button
              onClick={acceptCall}
              size="lg"
              className="h-16 w-16 rounded-full bg-green-500 p-0 hover:bg-green-600"
            >
              <Phone className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Remote Video (Main View) */}
      <div className="h-full w-full">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
          poster="/remote-participant-video-call.jpg"
        />
        {/* Placeholder for remote video */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary">
              <span className="text-4xl font-bold text-primary-foreground">
                JD
              </span>
            </div>
            <p className="text-lg font-medium text-white">John Doe</p>
          </div>
        </div>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute right-6 top-6 h-40 w-56 overflow-hidden rounded-lg border-2 border-white/20 shadow-2xl">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <span className="text-xl font-bold text-primary-foreground">
                  You
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-8">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleMute}
          className="h-14 w-14 rounded-full p-0"
        >
          {isMuted ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleVideo}
          className="h-14 w-14 rounded-full p-0"
        >
          {isVideoOff ? (
            <VideoOff className="h-6 w-6" />
          ) : (
            <Video className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="h-14 w-14 rounded-full bg-red-600 p-0 hover:bg-red-700"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      {/* Call Info */}
      <div className="absolute left-6 top-6 rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
        <p className="text-sm font-medium text-white">Call in progress...</p>
      </div>
    </div>
  );
};

export default VideoCall;
