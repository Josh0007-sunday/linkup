import { useState, useEffect } from "react";
import { HuddleProvider, HuddleClient } from "@huddle01/react";
import { useLocalAudio, useRoom, usePeerIds, useRemoteAudio } from "@huddle01/react/hooks";
import { Audio } from "@huddle01/react/components";
import toast from "react-hot-toast";

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
  const [isManuallyConnected, setIsManuallyConnected] = useState<boolean>(false); // New state

  const { joinRoom, leaveRoom, state: roomState } = useRoom({
    onJoin: (data) => {
      console.log('Room joined successfully, roomState:', roomState, 'data:', data);
      toast.success('Successfully joined audio space');
      setIsManuallyConnected(true); // Ensure UI updates even if roomState lags
    },
    onLeave: (data) => {
      console.log('Room left successfully, roomState:', roomState, 'data:', data);
      toast.success('Left audio space');
      setIsManuallyConnected(false);
    },
    onFailed: (data) => {
      console.error('Room error:', data);
      toast.error('Error in audio space');
      setIsManuallyConnected(false);
    },
  });

  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { peerIds } = usePeerIds();

  // Check space status and auto-rejoin if creator
  useEffect(() => {
    const checkSpaceStatus = async () => {
      try {
        console.log('Checking space status for forumId:', forumId);
        const response = await fetch(`${import.meta.env.VITE_CONNECTION}/api/huddle/space-status/${forumId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('Space status response status:', response.status);
        if (!response.ok) {
          console.log('Space status fetch failed:', await response.text());
          return;
        }

        const data = await response.json();
        console.log('Space status response data:', data);
        
        if (data.active && data.roomId) {
          setSpaceActive(true);
          setRoomId(data.roomId);
          
          if (isCreator && roomState !== 'connected' && !isManuallyConnected) {
            console.log('Creator auto-rejoining active space:', data.roomId);
            await handleJoinRoom();
          }
        }
      } catch (error) {
        console.error('Failed to check space status:', error);
      }
    };

    checkSpaceStatus();
  }, [forumId, token, isCreator]);

  // Monitor roomState changes
  useEffect(() => {
    console.log('Current roomState:', roomState, 'isManuallyConnected:', isManuallyConnected);
  }, [roomState, isManuallyConnected]);

  const createRoom = async () => {
    try {
      setLoading(true);
      console.log('Creating room with token:', token);
      console.log('API endpoint:', `${import.meta.env.VITE_CONNECTION}/api/huddle/create-room`);
      const response = await fetch(`${import.meta.env.VITE_CONNECTION}/api/huddle/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ forumId }),
      });
      
      console.log('Create room response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Create room error response:', errorText);
        throw new Error(`Failed to create room: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Create room response data:', data);
      
      if (!data.success || !data.roomId) {
        throw new Error(data.error || 'Invalid room ID received');
      }

      setRoomId(data.roomId);
      setSpaceActive(true);
      return data.roomId;
    } catch (error) {
      console.error('Room creation error:', error);
      throw new Error('Failed to create audio room');
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (roomId: string) => {
    try {
      console.log('Fetching access token for roomId:', roomId);
      const response = await fetch(
        `${import.meta.env.VITE_CONNECTION}/api/huddle/get-token?roomId=${roomId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      console.log('Get token response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get token error response:', errorText);
        throw new Error(`Failed to get token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Get token response data:', data);
      
      if (!data.success || !data.token) {
        throw new Error(data.error || 'Invalid token received');
      }

      return data.token;
    } catch (error) {
      console.error('Token error:', error);
      throw new Error('Failed to get access token');
    }
  };

  const handleJoinRoom = async () => {
    if (roomState === 'connected' || isManuallyConnected) {
      console.log('Already connected, skipping join');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting join room process - isCreator:', isCreator, 'roomId:', roomId);
      const currentRoomId = roomId || (isCreator ? await createRoom() : null);
      
      if (!currentRoomId) {
        throw new Error('No active audio space to join');
      }
      
      const accessToken = await getAccessToken(currentRoomId);
      console.log('Joining room with:', { roomId: currentRoomId, token: accessToken });
      
      await joinRoom({
        roomId: currentRoomId,
        token: accessToken,
      });
      console.log('joinRoom called, awaiting state update');
      setIsManuallyConnected(true); // Assume success if no error thrown
    } catch (err) {
      console.error('Join error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to join audio space';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsManuallyConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    if (roomState === 'connected' || isManuallyConnected) {
      console.log('Leaving room');
      leaveRoom();
      setIsManuallyConnected(false);
    }
  };

  const toggleAudio = () => {
    if (isAudioOn) {
      console.log('Disabling audio');
      disableAudio();
      toast.success('Muted');
    } else {
      console.log('Enabling audio');
      enableAudio();
      toast.success('Unmuted');
    }
  };

  return (
    <HuddleProvider client={huddleClient}>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          Audio Space
        </h3>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 text-red-600 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {isCreator && !spaceActive && (
                <button
                  onClick={handleJoinRoom}
                  disabled={roomState === 'connected' || isManuallyConnected || loading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    roomState === 'connected' || isManuallyConnected || loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Start Audio Space
                </button>
              )}
              {isCreator && spaceActive && roomState !== 'connected' && !isManuallyConnected && (
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="px-4 py-2 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  Rejoin Audio Space
                </button>
              )}
              {!isCreator && spaceActive && roomState !== 'connected' && !isManuallyConnected && (
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="px-4 py-2 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  Join Audio Space
                </button>
              )}
              {(roomState === 'connected' || isManuallyConnected) && (
                <>
                  <button
                    onClick={handleLeaveRoom}
                    className="px-4 py-2 rounded-md transition-colors bg-red-600 text-white hover:bg-red-700"
                  >
                    Leave Space
                  </button>
                  <button
                    onClick={toggleAudio}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      isAudioOn
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isAudioOn ? 'Mute Mic' : 'Unmute Mic'}
                  </button>
                </>
              )}
            </div>

            {!spaceActive && !isCreator && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-600">Waiting for the creator to start an audio space.</p>
              </div>
            )}

            {(roomState === 'connected' || isManuallyConnected) && (
              <div className="space-y-4">
                {peerIds.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-2">
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
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">No other participants yet.</p>
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
    <div className="flex items-center gap-3 bg-white p-2 rounded border">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        <Audio stream={remoteAudioStream} />
      </div>
    </div>
  ) : null;
};

export default AudioSpace;