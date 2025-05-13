import { useState, useRef, useEffect } from 'react';
import {
  useRoom,
  useLocalVideo,
  useLocalAudio,
  useLocalScreenShare,
  usePeerIds,
} from '@huddle01/react/hooks';
import { LogIn, LogOut, Video, VideoOff, Mic, MicOff, Monitor, X, Users, Copy } from 'lucide-react';
import eMeetImage from '../../assets/e_meet.svg';

const API_BASE_URL = import.meta.env.VITE_CONNECTION;


// Create a separate component for remote peer videos to properly use hooks
const RemotePeerVideo = ({ peerId }: { peerId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // This is now correctly placed inside a component body
  const { stream } = useRemoteVideo({ peerId });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="relative w-56 h-40">
        {stream ? (
          <video
            autoPlay
            playsInline
            ref={videoRef}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center transition-opacity duration-300">
            <div className="bg-white/50 p-4 rounded-full mb-2">
              <Users size={32} className="text-gray-400" />
            </div>
            <span className="text-gray-500 text-xs">Camera off</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-white text-sm font-medium">
              {peerId.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// We need to import this hook separately to use it in the RemotePeerVideo component
import { useRemoteVideo } from '@huddle01/react/hooks';

const VideoCall = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [inputRoomId, setInputRoomId] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const shareVideoRef = useRef<HTMLVideoElement>(null);

  // Generate room URL
  const roomUrl = roomId ? `${API_BASE_URL}?roomId=${roomId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomUrl);
    alert('Room URL copied to clipboard!');
  };

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => {
      setIsJoined(true);
      enableVideo().catch((err) => setError(`Failed to enable video: ${err.message}`));
    },
    onLeave: () => {
      setIsJoined(false);
    },
  });

  const { stream: videoStream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { stream: audioStream, enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { peerIds } = usePeerIds();

  useEffect(() => {
    if (videoRef.current && videoStream) videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  useEffect(() => {
    if (shareVideoRef.current && shareStream) shareVideoRef.current.srcObject = shareStream;
  }, [shareStream]);

  const handleCreateRoom = async () => {
    try {
      setError(null);
      const roomRes = await fetch(`${API_BASE_URL}/api/create-room`, { method: 'POST' });
      if (!roomRes.ok) throw new Error(`Server responded with ${roomRes.status}`);
      const { roomId } = await roomRes.json();
      setRoomId(roomId);

      const tokenRes = await fetch(`${API_BASE_URL}/api/token?roomId=${roomId}`);
      if (!tokenRes.ok) throw new Error(`Token request failed with ${tokenRes.status}`);
      const { token } = await tokenRes.json();
      setAccessToken(token);
    } catch (error) {
      setError((error as Error).message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError(null);
      if (!inputRoomId) throw new Error('Please enter a room ID');

      const tokenRes = await fetch(`${API_BASE_URL}/api/token?roomId=${inputRoomId}`);
      if (!tokenRes.ok) throw new Error(`Token request failed with ${tokenRes.status}`);
      const { token } = await tokenRes.json();

      setRoomId(inputRoomId);
      setAccessToken(token);
      joinRoom({ roomId: inputRoomId, token });
    } catch (error) {
      setError((error as Error).message || 'Failed to join room');
    }
  };

  useEffect(() => {
    // Check for roomId in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('roomId');
    if (urlRoomId) {
      setInputRoomId(urlRoomId);
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      if (!isJoined) return;
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isJoined]);

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Pre-Join UI - Professional layout */}
      {!isJoined && (
        <div className="absolute inset-0 flex items-center justify-between bg-gradient-to-br from-gray-50 to-gray-100 z-10 px-12">
          {/* Left side - Create/Join Room */}
          <div className="w-[480px] bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Start or Join a Meeting</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center justify-between border border-red-100">
                <span className="text-sm">{error}</span>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Create Room Section */}
              <div className="space-y-4">
                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-lg transition font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Meeting
                </button>

                {roomId && (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Room ID:</span>
                      <span className="text-gray-600 bg-white px-3 py-1 rounded-md text-sm font-mono border border-gray-200">
                        {roomId}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-700 font-medium">Meeting Link:</span>
                        <button
                          onClick={copyToClipboard}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="text-xs bg-white p-2 rounded-md border border-gray-200 break-all font-mono">
                        {roomUrl}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or join existing meeting</span>
                </div>
              </div>

              {/* Join Room Section */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Meeting ID
                  </label>
                  <input
                    type="text"
                    id="roomId"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Paste meeting ID here"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!inputRoomId}
                  className={`w-full px-4 py-3.5 rounded-lg transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg ${inputRoomId
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <LogIn size={18} />
                  Join Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Right side - e_meet.svg image */}
          <div className="flex-1 flex justify-center items-center pl-12">
            <div className="max-w-[600px] w-full">
              <img src={eMeetImage} alt="E-Meet" className="w-full h-auto" />
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to E-Meet</h2>
                <p className="text-gray-600">Connect with your team through high-quality video meetings</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {shareStream ? (
          <div className={`relative h-[75vh] w-[60vw] rounded-2xl overflow-hidden border-2 ${isAudioOn
              ? 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.7)]'
              : 'border-gray-200 shadow-lg'
            } transition-all duration-300`}>
            <video
              autoPlay
              playsInline
              ref={shareVideoRef}
              className="w-full h-full object-cover"
            />
            {videoStream && (
              <div className={`absolute bottom-4 right-4 w-48 h-36 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow border-2 ${isAudioOn
                  ? 'border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                  : 'border-gray-200'
                } transition-all duration-300`}>
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ) : videoStream ? (
          <video
            autoPlay
            playsInline
            muted
            ref={videoRef}
            className={`h-[70vh] w-auto max-w-[60vw] rounded-2xl border-2 ${isAudioOn
                ? 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.7)]'
                : 'border-gray-200 shadow-lg'
              } transition-all duration-300`}
          />
        ) : isJoined ? (
          <div className={`h-[70vh] w-[60vw] rounded-2xl border-2 ${isAudioOn
              ? 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
              : 'border-gray-200 shadow-lg'
            } transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center`}>
            <div className="bg-white/50 p-6 rounded-full mb-4">
              <Users size={64} className="text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 font-medium">Camera is off</p>
            <p className="text-sm text-gray-500 mt-2">Enable your camera to begin</p>
          </div>
        ) : null}
      </div>

      {/* Peer Video Feeds */}
      {isJoined && peerIds.length > 0 && (
        <div className="absolute bottom-8 right-8 flex gap-4 z-10">
          {peerIds.map((peerId: string) => (
            <RemotePeerVideo key={peerId} peerId={peerId} />
          ))}
        </div>
      )}

      {/* Controls */}
      {isJoined && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-lg py-2 px-4 rounded-full ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } transition-opacity duration-300`}
        >
          <div className="flex gap-4">
            <button
              onClick={() =>
                isVideoOn
                  ? disableVideo()
                  : enableVideo().catch((err) =>
                    setError(`Failed to enable video: ${err.message}`)
                  )
              }
              className={`p-2 rounded-full ${isVideoOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button
              onClick={() => (isAudioOn ? disableAudio() : enableAudio())}
              className={`p-2 rounded-full ${isAudioOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
            >
              {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() =>
                shareStream
                  ? stopScreenShare()
                  : startScreenShare().catch((err) =>
                    setError(`Failed to start screen share: ${err.message}`)
                  )
              }
              className={`p-2 rounded-full ${shareStream ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              <Monitor size={20} />
            </button>
            <button
              onClick={leaveRoom}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Room ID */}
      {isJoined && roomId && (
        <div className="absolute top-4 left-4 bg-white text-gray-700 text-xs rounded-full px-3 py-1 font-medium border border-gray-200">
          Room: {roomId}
        </div>
      )}

      {/* Error */}
      {error && isJoined && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-red-600 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-red-200">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;