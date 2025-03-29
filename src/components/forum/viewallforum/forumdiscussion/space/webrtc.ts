// src/utils/webrtc.ts
export interface WebRTCOptions {
    onRemoteStream: (userId: string, stream: MediaStream) => void;
    onSignal: (userId: string, signal: any) => void;
    onConnectionStateChange?: (userId: string, state: RTCPeerConnectionState) => void;
  }
  
  export const initializeWebRTC = (
    _userId: string,
    _isCreator: boolean,
    isSpeaker: boolean,
    localStream: MediaStream | null,
    options: WebRTCOptions
  ) => {
    const peerConnections: Record<string, RTCPeerConnection> = {};
  
    const createPeerConnection = (targetUserId: string) => {
      if (peerConnections[targetUserId]) {
        return peerConnections[targetUserId];
      }
  
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add your TURN servers here if needed
        ]
      });
  
      // Add local stream if available and user is a speaker
      if (localStream && isSpeaker) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }
  
      // Handle incoming tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          options.onRemoteStream(targetUserId, event.streams[0]);
        }
      };
  
      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          options.onSignal(targetUserId, { 
            type: 'candidate', 
            candidate: event.candidate 
          });
        }
      };
  
      // Connection state handler
      pc.onconnectionstatechange = () => {
        if (options.onConnectionStateChange) {
          options.onConnectionStateChange(targetUserId, pc.connectionState);
        }
      };
  
      peerConnections[targetUserId] = pc;
      return pc;
    };
  
    const closeAllConnections = () => {
      Object.entries(peerConnections).forEach(([userId, pc]) => {
        pc.close();
        delete peerConnections[userId];
      });
    };
  
    const closeConnection = (userId: string) => {
      if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
      }
    };
  
    return {
      createPeerConnection,
      closeAllConnections,
      closeConnection,
      getPeerConnection: (userId: string) => peerConnections[userId],
      getPeerConnections: () => peerConnections
    };
  };