import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { initializeWebRTC } from "./webrtc";

interface Speaker {
  user: string;
  name: string;
  img: string;
  type: 'creator' | 'invited';
}

interface MicRequest {
  user: string;
  name: string;
  img: string;
  timestamp: Date;
}

interface SpaceState {
  isActive: boolean;
  currentSpeakers: Speaker[];
  micRequests: MicRequest[];
}

interface SpaceControlProps {
  forumId: string;
  isCreator: boolean;
  userId: string;
  token: string;
  space: SpaceState;
  onSpaceUpdate: (updatedSpace: SpaceState) => void;
  apiBaseUrl: string;
}

const DEFAULT_USER_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/010/260/479/small/default-avatar-profile-icon-of-social-media-user-in-clipart-style-vector.jpg";

const SpaceControl = ({
  forumId,
  isCreator,
  userId,
  token,
  space,
  onSpaceUpdate,
  apiBaseUrl
}: SpaceControlProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasRequestedMic, setHasRequestedMic] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  
  // Initialize webRTC ref with null and provide type
  const webRTC = useRef<ReturnType<typeof initializeWebRTC> | null>(null);
  
  // Create a ref for audio elements with proper typing
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Check if current user is a speaker
  const isSpeaker = useCallback(() => {
    return space.currentSpeakers.some(speaker => speaker.user === userId);
  }, [space.currentSpeakers, userId]);

  // Initialize WebRTC when space becomes active
  useEffect(() => {
    if (space.isActive) {
      webRTC.current = initializeWebRTC(
        userId,
        isCreator,
        isSpeaker(),
        localStream,
        {
          onRemoteStream: (userId, stream) => {
            setRemoteStreams(prev => ({ ...prev, [userId]: stream }));
          },
          onSignal: (userId, signal) => {
            // Implement your signaling logic here (via WebSocket or API)
            console.log('Signal to send:', userId, signal);
            // Example: signalingChannel.sendSignal(userId, signal);
          },
          onConnectionStateChange: (userId, state) => {
            console.log(`Connection with ${userId} changed to: ${state}`);
          }
        }
      );

      return () => {
        if (webRTC.current) {
          webRTC.current.closeAllConnections();
        }
        setRemoteStreams({});
      };
    }
  }, [space.isActive, localStream, isCreator, userId, isSpeaker]);

  // Handle peer connections when speakers change
  useEffect(() => {
    if (!webRTC.current || !space.isActive) return;

    // Connect to new speakers
    space.currentSpeakers.forEach(speaker => {
        if (speaker.user !== userId && !webRTC.current?.getPeerConnection(speaker.user)) {
          const pc = webRTC.current?.createPeerConnection(speaker.user);
          
          // For the creator, create an offer immediately
          if (isCreator && pc) {
            pc.createOffer()
              .then(offer => pc.setLocalDescription(offer))
              .then(() => {
                // Send the offer through your signaling channel
                if (pc.localDescription) {
                  // signalingChannel.sendSignal(speaker.user, { type: 'offer', offer: pc.localDescription });
                }
              });
          }
        }
      });

    // Remove disconnected speakers
    const currentPeerIds = Object.keys(webRTC.current.getPeerConnections());
    currentPeerIds.forEach(peerId => {
      if (!space.currentSpeakers.some(s => s.user === peerId)) {
        webRTC.current?.closeConnection(peerId);
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[peerId];
          return newStreams;
        });
      }
    });
  }, [space.currentSpeakers, space.isActive, userId, isCreator]);

  // Handle signaling messages (simplified example)
  useEffect(() => {
    if (!webRTC.current || !space.isActive) return;

    const handleSignal = async (signal: { from: string; data: any }) => {
      const pc = webRTC.current?.getPeerConnection(signal.from);
      if (!pc) return;

      try {
        if (signal.data.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          // Send answer back through signaling channel
          // signalingChannel.sendSignal(signal.from, { type: 'answer', answer: pc.localDescription });
        } else if (signal.data.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        } else if (signal.data.type === 'candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(signal.data.candidate));
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    };

    // Subscribe to signaling channel
    // const subscription = signalingChannel.subscribe(handleSignal);
    
    return () => {
      // subscription.unsubscribe();
    };
  }, [space.isActive]);

  // Set audio elements when remote streams change
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      const audio = audioRefs.current[userId];
      if (audio && audio.srcObject !== stream) {
        audio.srcObject = stream;
        audio.play().catch(e => console.error('Audio play error:', e));
      }
    });
  }, [remoteStreams]);

  // Start Space function
  const handleStartSpace = async () => {
    try {
      const response = await axios.post<{ space: SpaceState }>(
        `${apiBaseUrl}/${forumId}/space/start`,
        null,
        { headers: { "x-auth-token": token } }
      );
      
      if (response.data.space) {
        toast.success("Space started successfully!");
        onSpaceUpdate(response.data.space);
        
        // Request microphone access for creator
        if (isCreator) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            setIsSpeaking(true);
          } catch (err) {
            toast.error("Microphone access denied");
            console.error("Microphone error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error starting space:", error);
      toast.error("Failed to start space");
    }
  };

  // End Space function
  const handleEndSpace = async () => {
    try {
      const response = await axios.post<{ space: SpaceState }>(
        `${apiBaseUrl}/${forumId}/space/end`,
        null,
        { headers: { "x-auth-token": token } }
      );
      
      if (response.data.space) {
        toast.success("Space ended successfully");
        onSpaceUpdate(response.data.space);
        
        // Stop local audio stream
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error("Error ending space:", error);
      toast.error("Failed to end space");
    }
  };

  // Request Mic function
  const handleRequestMic = async () => {
    try {
      const response = await axios.post<{ forum: { space: SpaceState } }>(
        `${apiBaseUrl}/${forumId}/space/request-mic`,
        null,
        { headers: { "x-auth-token": token } }
      );
      
      if (response.data.forum.space) {
        toast.success("Mic requested successfully");
        setHasRequestedMic(true);
        onSpaceUpdate(response.data.forum.space);
      }
    } catch (error) {
      console.error("Error requesting mic:", error);
      toast.error("Failed to request mic");
    }
  };

  // Approve Mic Request function (creator only)
  const handleApproveMic = async (requestUserId: string) => {
    try {
      const response = await axios.post<{ forum: { space: SpaceState } }>(
        `${apiBaseUrl}/${forumId}/space/approve-mic/${requestUserId}`,
        null,
        { headers: { "x-auth-token": token } }
      );
      
      if (response.data.forum.space) {
        toast.success("Mic request approved");
        onSpaceUpdate(response.data.forum.space);
      }
    } catch (error) {
      console.error("Error approving mic:", error);
      toast.error("Failed to approve mic request");
    }
  };

  // Remove Speaker function (creator only)
  const handleRemoveSpeaker = async (speakerId: string) => {
    try {
      const response = await axios.post<{ forum: { space: SpaceState } }>(
        `${apiBaseUrl}/${forumId}/space/remove-speaker/${speakerId}`,
        null,
        { headers: { "x-auth-token": token } }
      );
      
      if (response.data.forum.space) {
        toast.success("Speaker removed");
        onSpaceUpdate(response.data.forum.space);
      }
    } catch (error) {
      console.error("Error removing speaker:", error);
      toast.error("Failed to remove speaker");
    }
  };

  // Toggle speaking state
  const toggleSpeaking = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsSpeaking(!isSpeaking);
    }
  };

  // Check if user has pending mic request
  useEffect(() => {
    if (space.isActive) {
      const hasRequest = space.micRequests.some(request => request.user === userId);
      setHasRequestedMic(hasRequest);
    } else {
      setHasRequestedMic(false);
    }
  }, [space.micRequests, userId, space.isActive]);

  // Clean up audio streams on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (webRTC.current) {
        webRTC.current.closeAllConnections();
      }
    };
  }, [localStream]);

  if (!space.isActive && !isCreator) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-gray-100">
      {/* Hidden audio elements for remote streams */}
      {Object.keys(remoteStreams).map(userId => (
        <audio
          key={userId}
          ref={(el) => {
            // Explicitly assign the ref 
            audioRefs.current[userId] = el;
          }}
          autoPlay
          playsInline
          className="hidden"
        />
      ))}

      {space.isActive ? (
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Live Space
          </h3>

          {/* Current Speakers */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Speakers</h4>
            {space.currentSpeakers.map((speaker, index) => (
              <div key={index} className={`flex items-center p-2 rounded-lg bg-gray-50 ${
                isSpeaking && speaker.user === userId ? 'speaker-active' : ''
              }`}>
                <div className="relative">
                  <img
                    src={speaker.img || DEFAULT_USER_IMAGE}
                    alt={speaker.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100"
                  />
                  {/* Speaking indicator */}
                  {isSpeaking && speaker.user === userId && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{speaker.name}</p>
                  <p className="text-xs text-gray-500">
                    {speaker.type === 'creator' ? 'Host' : 'Speaker'}
                  </p>
                </div>
                {isCreator && speaker.type !== 'creator' && (
                  <button 
                    onClick={() => handleRemoveSpeaker(speaker.user)}
                    className="ml-auto text-gray-400 hover:text-red-500"
                    aria-label={`Remove ${speaker.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Mic Requests (visible to creator) */}
          {isCreator && space.micRequests.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mic Requests</h4>
              {space.micRequests.map((request, index) => (
                <div key={index} className="flex items-center p-2 rounded-lg bg-gray-50">
                  <img
                    src={request.img || DEFAULT_USER_IMAGE}
                    alt={request.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{request.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleApproveMic(request.user)}
                    className="ml-auto px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Space Controls */}
          <div className="flex space-x-2 pt-2">
            {isCreator ? (
              <button
                onClick={handleEndSpace}
                className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                End Space
              </button>
            ) : isSpeaker() ? (
              <button
                onClick={toggleSpeaking}
                className={`flex-1 py-2 rounded-md flex items-center justify-center transition-colors ${
                  isSpeaking 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isSpeaking ? 'Mute' : 'Unmute'}
              </button>
            ) : hasRequestedMic ? (
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center justify-center cursor-not-allowed"
                disabled
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Requested
              </button>
            ) : (
              <button
                onClick={handleRequestMic}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Request Mic
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3">
            Start a Space
          </h3>
          <button
            onClick={handleStartSpace}
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 011.414 1.414" />
            </svg>
            Start Space
          </button>
        </div>
      )}
    </div>
  );
};

export default SpaceControl;