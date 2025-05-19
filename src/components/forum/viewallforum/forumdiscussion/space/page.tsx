import { useState, useEffect } from "react";
import { HuddleProvider, HuddleClient } from "@huddle01/react";
import { useLocalAudio, useRoom, usePeerIds, useRemoteAudio } from "@huddle01/react/hooks";
import { Audio } from "@huddle01/react/components";
import toast from "react-hot-toast";
import io, { Socket } from "socket.io-client";

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "2dkFPqrEKGMGO9iFR0nvZnlv7kU72R9e",
});

interface AudioSpaceProps {
  forumId: string;
  isCreator: boolean;
  token: string;
}

const AudioSpace = ({ forumId, isCreator, token }: AudioSpaceProps) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [spaceActive, setSpaceActive] = useState<boolean>(false);
  const [, setSocket] = useState<Socket | null>(null);

  const { joinRoom, leaveRoom, state: roomState } = useRoom({
    onJoin: () => {
      console.log("Room joined successfully, roomState:", roomState);
      toast.success("Successfully joined audio space");
    },
    onLeave: () => {
      console.log("Room left successfully, roomState:", roomState);
      toast.success("Left audio space");
    },
    onFailed: (data) => {
      console.error("Room error:", data);
      toast.error("Error in audio space");
      setError("Failed to connect to audio space");
    },
  });

  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { peerIds } = usePeerIds();

  // Initialize Socket.IO and listen for space status changes
  useEffect(() => {
    const socketIo = io(import.meta.env.VITE_CONNECTION, {
      auth: { token },
    });
    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to Socket.IO server");
      socketIo.emit("joinForum", forumId); // Join the forum room
    });

    socketIo.on("spaceStatusChanged", (data: { active: boolean; roomId?: string }) => {
      console.log("Received spaceStatusChanged:", data);
      setSpaceActive(data.active);
      setRoomId(data.active ? data.roomId || null : null);

      // Auto-join for creator when space becomes active
      if (isCreator && data.active && data.roomId && roomState !== "connected") {
        console.log("Creator auto-joining room:", data.roomId);
        handleJoinRoom(data.roomId);
      }
    });

    return () => {
      socketIo.disconnect();
    };
  }, [forumId, token, isCreator]);

  // Check initial space status on mount
  useEffect(() => {
    const checkSpaceStatus = async () => {
      try {
        console.log("Checking initial space status for forumId:", forumId);
        const response = await fetch(
          `${import.meta.env.VITE_CONNECTION}/api/huddle/space-status/${forumId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          console.error("Space status fetch failed:", await response.text());
          return;
        }

        const data = await response.json();
        console.log("Initial space status:", data);

        setSpaceActive(data.active);
        setRoomId(data.active ? data.roomId : null);

        // Auto-join for creator if space is already active
        if (isCreator && data.active && data.roomId && roomState !== "connected") {
          console.log("Creator auto-joining on mount:", data.roomId);
          handleJoinRoom(data.roomId);
        }
      } catch (error) {
        console.error("Failed to check space status:", error);
      }
    };

    checkSpaceStatus();
  }, [forumId, token, isCreator]);

  // Monitor roomState changes
  useEffect(() => {
    console.log("Current roomState:", roomState);
  }, [roomState]);

  const createRoom = async () => {
    try {
      setLoading(true);
      console.log("Creating room with token:", token);
      const response = await fetch(`${import.meta.env.VITE_CONNECTION}/api/huddle/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ forumId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create room: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Create room response:", data);

      if (!data.success || !data.roomId) {
        throw new Error(data.error || "Invalid room ID received");
      }

      setRoomId(data.roomId);
      setSpaceActive(true);
      return data.roomId;
    } catch (error) {
      console.error("Room creation error:", error);
      throw new Error("Failed to create audio room");
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (roomId: string) => {
    try {
      console.log("Fetching access token for roomId:", roomId);
      const response = await fetch(
        `${import.meta.env.VITE_CONNECTION}/api/huddle/get-token?roomId=${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Get token response:", data);

      if (!data.success || !data.token) {
        throw new Error(data.error || "Invalid token received");
      }

      return data.token;
    } catch (error) {
      console.error("Token error:", error);
      throw new Error("Failed to get access token");
    }
  };

  const handleJoinRoom = async (overrideRoomId?: string) => {
    if (roomState === "connected") {
      console.log("Already connected, skipping join");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Starting join room process - isCreator:", isCreator, "roomId:", overrideRoomId || roomId);
      const currentRoomId = overrideRoomId || roomId || (isCreator ? await createRoom() : null);

      if (!currentRoomId) {
        throw new Error("No active audio space to join");
      }

      const accessToken = await getAccessToken(currentRoomId);
      console.log("Joining room with:", { roomId: currentRoomId, token: accessToken });

      await joinRoom({
        roomId: currentRoomId,
        token: accessToken,
      });
    } catch (err) {
      console.error("Join error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to join audio space";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (roomState === "connected") {
      console.log("Leaving room");
      leaveRoom();

      // If creator, notify backend to end the space
      if (isCreator) {
        try {
          await fetch(`${import.meta.env.VITE_CONNECTION}/api/huddle/end-space/${forumId}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Notified backend to end space");
        } catch (error) {
          console.error("Failed to end space:", error);
          toast.error("Failed to end audio space");
        }
      }
    }
  };

  const toggleAudio = () => {
    if (isAudioOn) {
      console.log("Disabling audio");
      disableAudio();
      toast.success("Muted");
    } else {
      console.log("Enabling audio");
      enableAudio();
      toast.success("Unmuted");
    }
  };

  return (
    <HuddleProvider client={huddleClient}>
      <div className="p-4 bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
          Audio Space
        </h3>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 mb-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {isCreator && !spaceActive && (
                <button
                  onClick={() => handleJoinRoom()}
                  disabled={roomState === "connected" || loading}
                  className={`px-4 py-2 rounded-full transition-all ${
                    roomState === "connected" || loading
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  }`}
                >
                  Start Audio Space
                </button>
              )}
              {!isCreator && spaceActive && roomState !== "connected" && (
                <button
                  onClick={() => handleJoinRoom()}
                  disabled={loading}
                  className="px-4 py-2 rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Join Audio Space
                </button>
              )}
              {roomState === "connected" && (
                <>
                  <button
                    onClick={handleLeaveRoom}
                    className="px-4 py-2 rounded-full transition-all bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    {isCreator ? "End Space" : "Leave Space"}
                  </button>
                  <button
                    onClick={toggleAudio}
                    className={`px-4 py-2 rounded-full transition-all ${
                      isAudioOn
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                    } shadow-md hover:shadow-lg transform hover:-translate-y-1`}
                  >
                    {isAudioOn ? "Mute Mic" : "Unmute Mic"}
                  </button>
                </>
              )}
            </div>

            {!spaceActive && !isCreator && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-purple-500/20">
                <p className="text-purple-300/80">Waiting for the creator to start an audio space.</p>
              </div>
            )}

            {roomState === "connected" && (
              <div className="space-y-4">
                {peerIds.length > 0 && (
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-purple-500/20">
                    <p className="text-sm font-medium text-purple-400 mb-3">
                      Participants ({peerIds.length})
                    </p>
                    <div className="space-y-3">
                      {peerIds.map((peerId) => (
                        <RemotePeerAudio key={peerId} peerId={peerId} />
                      ))}
                    </div>
                  </div>
                )}
                {peerIds.length === 0 && (
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-purple-500/20">
                    <p className="text-sm text-purple-300/80">No other participants yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </HuddleProvider>
  );
};

const RemotePeerAudio = ({ peerId }: { peerId: string }) => {
  const { stream: remoteAudioStream } = useRemoteAudio({ peerId });

  return remoteAudioStream ? (
    <div className="flex items-center gap-3 bg-gray-900/30 p-3 rounded-xl border border-purple-500/20">
      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-purple-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex-1">
        <Audio stream={remoteAudioStream} />
      </div>
    </div>
  ) : null;
};

export default AudioSpace;