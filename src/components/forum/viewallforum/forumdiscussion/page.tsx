import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import AudioSpace from "./space/page";

interface Attendee {
  user: string | { _id: string };
  name: string;
  img: string;
  status: string;
}

interface Forum {
  _id: string;
  name: string;
  description: string;
  imageUri: string;
  creator: string;
  creatorName: string;
  creatorImg: string;
  creatorStatus: string;
  attendees: Attendee[];
  messages: {
    _id?: string;
    sender: string;
    senderName: string;
    senderImg: string;
    content: string;
    timestamp: Date;
  }[];
  isPublic: boolean;
  space?: {
    isActive: boolean;
    currentSpeakers: {
      user: string;
      name: string;
      img: string;
      type: 'creator' | 'invited';
    }[];
    micRequests: {
      user: string;
      name: string;
      img: string;
      timestamp: Date;
    }[];
  }
}

const ForumDiscussion = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [, setLoading] = useState<boolean>(true);
  const [error, ] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ name: string, id: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messageBuffer, setMessageBuffer] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('connecting');
  const [isLoadingSilently, setIsLoadingSilently] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed on mobile

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;
  const token = localStorage.getItem("auth-token") || "";
  const [isCreator, setIsCreator] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectDelayRef = useRef(1000);

  const getImageUrl = useCallback((img: string | null | undefined, defaultImg: string): string => {
    if (!img) return defaultImg;
    return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
  }, [API_BASE_URL]);

  const DEFAULT_USER_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/010/260/479/small/default-avatar-profile-icon-of-social-media-user-in-clipart-style-vector.jpg";

  const initializeSocket = useCallback(() => {
    console.log("Initializing socket connection...");
    setConnectionStatus('connecting');

    const newSocket = io(API_BASE_URL, {
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
      transports: ['websocket'],
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      setConnectionStatus('connected');
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      reconnectDelayRef.current = 1000;

      if (forumId) {
        newSocket.emit('joinForum', forumId);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket:", reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');

      if (reason === "io server disconnect") {
        setConnectionError("Server disconnected. Reconnecting...");
        setTimeout(() => {
          newSocket.connect();
        }, 1000);
      }
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      setConnectionStatus('reconnecting');
      setConnectionError(`Reconnecting... (attempt ${attempt})`);
      reconnectDelayRef.current = Math.min(10000, reconnectDelayRef.current * 2);
    });

    newSocket.on("reconnect_failed", () => {
      console.log("Reconnection failed");
      setConnectionStatus('disconnected');
      setConnectionError("Connection lost. Please refresh the page.");
    });

    newSocket.on("connect_error", (err) => {
      console.log("Connection error:", err.message);
      setConnectionStatus('disconnected');
      setConnectionError("Connection error. Trying to reconnect...");
      setIsConnected(false);
    });

    newSocket.on("error", (err) => {
      console.error("Socket error:", err);
      setConnectionError("Connection error occurred");
    });

    setSocket(newSocket);
    return newSocket;
  }, [API_BASE_URL, token, forumId]);

  const processMessageBuffer = useCallback(() => {
    if (messageBuffer.length === 0) return;

    setForum(prevForum => {
      if (!prevForum) return prevForum;

      const uniqueMessages = messageBuffer.reduce((acc, msg) => {
        const isDuplicate = acc.some((m: { _id: any; sender: any; content: any; timestamp: string | number | Date; }) =>
          m._id === msg._id ||
          (m.sender === msg.sender &&
            m.content === msg.content &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 1000)
        );
        return isDuplicate ? acc : [...acc, msg];
      }, [...prevForum.messages]);

      return {
        ...prevForum,
        messages: uniqueMessages.slice(-500)
      };
    });

    setMessageBuffer([]);
    bufferTimeoutRef.current = null;
  }, [messageBuffer]);

  const setupSocketListeners = useCallback((socket: Socket) => {
    if (!socket || !forumId) return;

    socket.emit('joinForum', forumId);

    const messageListener = (newMessage: any) => {
      try {
        setMessageBuffer(prev => [...prev, newMessage]);

        if (!bufferTimeoutRef.current) {
          bufferTimeoutRef.current = setTimeout(() => {
            processMessageBuffer();
          }, 100);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    const userJoinedListener = ({ user: joinedUser }: { user: any }) => {
      try {
        setForum(prevForum => {
          if (!prevForum) return prevForum;

          const isAlreadyAttendee = prevForum.attendees.some(attendee =>
            (typeof attendee.user === 'object' ? attendee.user._id : attendee.user) === joinedUser.id
          );

          if (isAlreadyAttendee) return prevForum;

          toast.success(`${joinedUser.name} joined the forum`);
          return {
            ...prevForum,
            attendees: [
              ...prevForum.attendees,
              {
                user: joinedUser.id,
                name: joinedUser.name,
                img: joinedUser.img,
                status: joinedUser.status || "Active"
              }
            ]
          };
        });
      } catch (error) {
        console.error("Error processing user join:", error);
      }
    };

    const userLeftListener = ({ userId: leftUserId, userName }: { userId: string, userName: string }) => {
      try {
        setForum(prevForum => {
          if (!prevForum) return prevForum;

          toast(`${userName} left the forum`);
          return {
            ...prevForum,
            attendees: prevForum.attendees.filter(attendee =>
              (typeof attendee.user === 'object' ? attendee.user._id : attendee.user) !== leftUserId
            )
          };
        });
      } catch (error) {
        console.error("Error processing user leave:", error);
      }
    };

    const forumDeletedListener = ({ forumId: deletedForumId }: { forumId: string }) => {
      try {
        if (deletedForumId === forumId) {
          toast.error("This forum has been deleted by the creator");
          navigate("/view-forum");
        }
      } catch (error) {
        console.error("Error processing forum deletion:", error);
      }
    };

    const typingListener = ({ userId: typingUserId, userName, isTyping: userIsTyping }:
      { userId: string, userName: string, isTyping: boolean }) => {
      try {
        if (typingUserId === userId) return;

        setTypingUsers(prev => {
          if (userIsTyping) {
            return prev.some(u => u.id === typingUserId)
              ? prev
              : [...prev, { id: typingUserId, name: userName }];
          } else {
            return prev.filter(u => u.id !== typingUserId);
          }
        });
      } catch (error) {
        console.error("Error processing typing indicator:", error);
      }
    };

    const connectionHealthListener = (status: { healthy: boolean, message?: string }) => {
      if (!status.healthy) {
        console.warn("Connection health warning:", status.message);
        setConnectionError(status.message || "Connection quality degraded");
      }
    };

    socket.on('newMessage', messageListener);
    socket.on('userJoined', userJoinedListener);
    socket.on('userLeft', userLeftListener);
    socket.on('forumDeleted', forumDeletedListener);
    socket.on('typing', typingListener);
    socket.on('connectionHealth', connectionHealthListener);

    return () => {
      socket.off('newMessage', messageListener);
      socket.off('userJoined', userJoinedListener);
      socket.off('userLeft', userLeftListener);
      socket.off('forumDeleted', forumDeletedListener);
      socket.off('typing', typingListener);
      socket.off('connectionHealth', connectionHealthListener);

      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
        processMessageBuffer();
      }
    };
  }, [forumId, navigate, userId, processMessageBuffer]);

  useEffect(() => {
    const newSocket = initializeSocket();
    const cleanupListeners = newSocket ? setupSocketListeners(newSocket) : undefined;

    const healthCheckInterval = setInterval(() => {
      if (newSocket && newSocket.connected) {
        newSocket.emit('ping', Date.now(), (latency: number) => {
          if (latency > 1000) {
            console.warn(`High latency detected: ${latency}ms`);
          }
        });
      }
    }, 30000);

    return () => {
      cleanupListeners?.();
      clearInterval(healthCheckInterval);
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
      if (newSocket) {
        newSocket.off();
        newSocket.disconnect();
      }
    };
  }, [initializeSocket, setupSocketListeners]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [forum?.messages, messageBuffer]);

  const handleTyping = useCallback(() => {
    if (!socket || !forumId || !isMember) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim() && !isTyping) {
      socket.emit('typing', {
        forumId,
        userId,
        userName: user.name,
        isTyping: true
      });
      setIsTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socket.emit('typing', {
          forumId,
          userId,
          userName: user.name,
          isTyping: false
        });
        setIsTyping(false);
      }
      typingTimeoutRef.current = null;
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, socket, forumId, userId, user.name, isTyping, isMember]);

  useEffect(() => {
    handleTyping();
  }, [message, handleTyping]);

  const fetchForumDetails = useCallback(async (silent = false) => {
    if (silent) {
      setIsLoadingSilently(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/forum/${forumId}`, {
        headers: { "x-auth-token": token },
        timeout: 10000,
      });

      const forumData = response.data;
      setForum(prev => {
        const messages = silent && prev?.messages ? prev.messages : forumData.messages;
        return { ...forumData, messages };
      });

      const creatorId = typeof forumData.creator === 'object'
        ? forumData.creator._id
        : forumData.creator;
      setIsCreator(creatorId.toString() === userId);

      const isAttendee = forumData.attendees.some((attendee: Attendee) =>
        (typeof attendee.user === 'object' ? attendee.user._id : attendee.user).toString() === userId
      );
      setIsMember(isCreator || isAttendee);

    } catch (error) {
      console.error("Error fetching forum details:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error("This forum doesn't exist or was deleted");
        navigate("/view-forum");
      }
    } finally {
      if (silent) {
        setIsLoadingSilently(false);
      } else {
        setLoading(false);
      }
    }
  }, [forumId, userId, token, API_BASE_URL, navigate]);

  useEffect(() => {
    fetchForumDetails();
    const refreshInterval = setInterval(() => {
      fetchForumDetails(true);
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      if (socket) {
        socket.emit('leaveForum', forumId);
      }
    };
  }, [fetchForumDetails, socket, forumId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !socket || !forumId || !forum) return;
    const messageContent = message.trim();
    const tempId = Date.now().toString();

    setForum(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            _id: tempId,
            sender: userId,
            senderName: user.name,
            senderImg: user.img || DEFAULT_USER_IMAGE,
            content: messageContent,
            timestamp: new Date(),
          }
        ]
      };
    });

    setMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      socket.emit('typing', {
        forumId,
        userId,
        userName: user.name,
        isTyping: false
      });
      setIsTyping(false);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${forumId}/message`,
        { content: messageContent },
        {
          headers: {
            "x-auth-token": token,
          },
          timeout: 5000,
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
        setForum(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.filter(msg => msg._id !== tempId)
          };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message. Please try again.");
      setForum(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(msg => msg._id !== tempId)
        };
      });

      if (axios.isAxiosError(error) && !error.response) {
        setTimeout(() => {
          handleSendMessage();
        }, 2000);
      }
    }
  };

  const handleJoinForum = async () => {
    try {
      setIsMember(true);
      toast.success("Joining forum...");

      const response = await axios.post(
        `${API_BASE_URL}/${forumId}/join`,
        null,
        {
          headers: {
            "x-auth-token": token,
          },
          timeout: 10000,
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
        setIsMember(false);
      } else {
        toast.success("You have joined the forum successfully!");

        if (socket) {
          socket.emit('joinForum', forumId);
        }

        let retries = 0;
        const fetchWithRetry = async () => {
          try {
            const updatedResponse = await axios.get(`${API_BASE_URL}/forum/${forumId}`, {
              headers: {
                "x-auth-token": token,
              },
              timeout: 5000,
            });
            setForum(updatedResponse.data);
          } catch (error) {
            if (retries < 3) {
              retries++;
              setTimeout(fetchWithRetry, 1000 * retries);
            }
          }
        };

        await fetchWithRetry();
      }
    } catch (error) {
      console.error("Error joining forum:", error);
      toast.error("An error occurred while joining the forum. Please try again.");
      setIsMember(false);

      if (axios.isAxiosError(error) && !error.response) {
        setTimeout(() => {
          handleJoinForum();
        }, 2000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = useCallback(() => {
    if (!forum?.messages.length && messageBuffer.length === 0) return [];

    const allMessages = [...(forum?.messages || []), ...messageBuffer];

    const grouped: { date: string; messages: typeof allMessages }[] = [];

    allMessages.forEach(msg => {
      const messageDate = new Date(msg.timestamp).toLocaleDateString();
      const existingGroup = grouped.find(group => group.date === messageDate);

      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        grouped.push({ date: messageDate, messages: [msg] });
      }
    });

    return grouped;
  }, [forum?.messages, messageBuffer]);

  const groupedMessages = groupMessagesByDate();

  const isCurrentUser = (senderId: string) => {
    return senderId === userId;
  };

  const renderConnectionStatus = () => {
    if (!isConnected || connectionStatus !== 'connected') {
      const statusMessages = {
        connecting: "Connecting to chat...",
        connected: "",
        disconnected: "Disconnected. Trying to reconnect...",
        reconnecting: "Reconnecting to chat..."
      };

      const message = connectionError || statusMessages[connectionStatus];

      return (
        <div className={`fixed bottom-16 right-4 px-4 py-2 rounded-lg text-sm shadow-lg z-50 ${connectionStatus === 'disconnected' ? 'bg-red-600 text-white' :
          connectionStatus === 'reconnecting' ? 'bg-yellow-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
          {message}
          {connectionStatus === 'disconnected' && (
            <button
              onClick={() => socket?.connect()}
              className="ml-2 underline"
            >
              Retry Now
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  const handleDemoButton = () => {
    toast.success("Demo button clicked!");
  };

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/30 backdrop-blur-xl p-4 flex items-center justify-between border-b border-purple-500/20 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/view-forum")}
            className="text-purple-300 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-purple-500/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-center">
            {forum?.imageUri && (
              <div className="relative">
                <img
                  src={getImageUrl(forum.imageUri, DEFAULT_USER_IMAGE)}
                  alt={forum.name}
                  className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-purple-500/20"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
              </div>
            )}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">{forum?.name}</h1>
            {isCreator && (
              <span className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full">
                Creator
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoadingSilently && (
        <div className="fixed bottom-20 left-4 text-xs font-medium text-purple-400 bg-gray-900/30 backdrop-blur-xl px-3 py-2 rounded-full border border-purple-500/20 flex items-center">
          <div className="animate-pulse mr-2 h-2 w-2 bg-purple-500 rounded-full"></div>
          Updating messages...
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Forum Image */}
            {forum?.imageUri && (
              <div className="bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden w-full transform transition hover:border-purple-500/40">
                <div className="relative h-48 w-full">
                  <img
                    src={getImageUrl(forum.imageUri, DEFAULT_USER_IMAGE)}
                    alt={forum.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h2 className="text-white text-xl font-bold">{forum.name}</h2>
                    <div className="flex items-center mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${forum.isPublic ? 'bg-green-400' : 'bg-amber-400'} mr-2`}></span>
                      <p className="text-white/90 text-sm">{forum.isPublic ? 'Public' : 'Private'} Forum</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Forum Description */}
            <div className="bg-gray-900/30 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <h3 className="text-sm uppercase tracking-wider font-semibold text-purple-400 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                About
              </h3>
              <p className="text-purple-300/80 text-sm leading-relaxed">{forum?.description || "No description available."}</p>
            </div>

            {/* Forum Creator */}
            <div className="bg-gray-900/30 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <h3 className="text-sm uppercase tracking-wider font-semibold text-purple-400 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                Creator
              </h3>
              {forum && (
                <div className="flex items-center p-4 bg-gray-800/50 rounded-xl border border-purple-500/20">
                  <div className="relative">
                    <img
                      src={getImageUrl(forum.creatorImg, DEFAULT_USER_IMAGE)}
                      alt={forum.creatorName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-purple-300">{forum.creatorName}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center text-xs text-purple-400/70">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                        {forum.creatorStatus || "Online"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Members List */}
            <div className="bg-gray-900/30 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <h3 className="text-base uppercase tracking-wider font-semibold text-purple-400 mb-6 flex items-center">
                <svg className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Members ({forum?.attendees.length || 0})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {forum?.attendees.map((attendee, index) => (
                  <div key={index} className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all transform hover:-translate-y-1">
                    <div className="relative mb-3">
                      <img
                        src={getImageUrl(attendee.img, DEFAULT_USER_IMAGE)}
                        alt={attendee.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/20"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                        attendee.status === "online" ? "bg-green-400" :
                        attendee.status === "away" ? "bg-amber-400" : "bg-gray-500"
                      }`}></div>
                    </div>
                    <p className="font-medium text-purple-300 text-sm text-center truncate w-full">{attendee.name}</p>
                    <p className="text-xs text-purple-400/70 capitalize">{attendee.status || "offline"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Space */}
            {forumId && (
              <div className="bg-gray-900/30 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <h3 className="text-base uppercase tracking-wider font-semibold text-purple-400 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Audio Space
                </h3>
                <div>
                  <AudioSpace
                    forumId={forumId}
                    isCreator={isCreator}
                    token={token}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Popup */}
      {showChat && isMember && (
        <div className="fixed bottom-0 right-0 w-full pr-4 md:w-96 h-[70vh] md:h-[80vh] bg-gray-900/30 backdrop-blur-xl rounded-t-2xl md:rounded-2xl border border-purple-500/20 shadow-2xl z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
            <h3 className="text-lg font-semibold flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Forum Chat
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-purple-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-800/50">
            {error ? (
              <div className="text-center p-4 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                <div className="flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                {error}
              </div>
            ) : (
              <>
                {forum?.messages.length === 0 && messageBuffer.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-purple-400">
                    <div className="bg-gray-900/30 p-6 rounded-full border border-purple-500/20 mb-4">
                      <svg className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="font-medium text-lg">No messages yet</p>
                    <p className="text-sm mt-1 text-purple-400/70">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(forum?.messages.length ? groupedMessages : []).map((group, groupIdx) => (
                      <div key={groupIdx} className="mb-6">
                        <div className="flex justify-center mb-4">
                          <div className="px-4 py-1 bg-purple-500/10 rounded-full text-xs font-medium text-purple-400 border border-purple-500/20">
                            {new Date(group.date).toLocaleDateString(undefined, {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {group.messages.map((msg, index) => {
                            const userIsSender = isCurrentUser(msg.sender);
                            return (
                              <div
                                key={msg._id || index}
                                className={`flex ${userIsSender ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`flex max-w-xs md:max-w-sm ${userIsSender ? 'flex-row-reverse' : 'flex-row'}`}>
                                  {!userIsSender && (
                                    <div className="flex-shrink-0 mr-3">
                                      <div className="relative">
                                        <img
                                          src={getImageUrl(msg.senderImg, DEFAULT_USER_IMAGE)}
                                          alt={msg.senderName}
                                          className="w-8 h-8 rounded-full object-cover border border-purple-500/20"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-black"></div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    {!userIsSender && (
                                      <span className="text-xs text-purple-400/70 mb-1 font-medium">{msg.senderName}</span>
                                    )}
                                    <div className="flex items-end">
                                      <div
                                        className={`py-3 px-4 rounded-2xl ${userIsSender
                                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                                          : 'bg-gray-800/50 text-purple-300 border border-purple-500/20 rounded-tl-none'
                                          }`}
                                      >
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                      </div>
                                      <span className={`text-xs text-purple-400/70 mx-2 mb-1 whitespace-nowrap ${userIsSender ? 'mr-0' : 'ml-0'}`}>
                                        {formatTime(msg.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {typingUsers.length > 0 && (
                      <div className="flex items-center space-x-2 pl-4 bg-gray-800/50 p-2 rounded-xl border border-purple-500/20">
                        <div className="flex space-x-1">
                          {typingUsers.slice(0, 3).map((user, index) => (
                            <div key={user.id} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }} />
                          ))}
                        </div>
                        <span className="text-xs text-purple-400 font-medium">
                          {typingUsers.length > 1
                            ? `${typingUsers.length} people are typing...`
                            : `${typingUsers[0].name} is typing...`}
                        </span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}
          </div>
          {isMember && (
            <div className="p-4 border-t border-purple-500/20 bg-gray-900/30">
              <div className="relative flex items-center">
                <textarea
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-gray-800/50 text-purple-300 placeholder-purple-400/50 px-4 py-3 pr-12 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 min-h-10 max-h-32 border border-purple-500/20"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`absolute right-2 p-2 rounded-full ${message.trim()
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    } transition-colors`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fixed Bottom Card with Buttons */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="bg-gray-900/30 backdrop-blur-xl rounded-full border border-purple-500/20 p-2 flex items-center space-x-3">
            {isMember ? (
              <>
                <button
                  onClick={() => setShowChat(true)}
                  className="flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </button>
                <button
                  onClick={handleDemoButton}
                  className="flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Canvas
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinForum}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Join Forum
              </button>
            )}
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          {!isExpanded ? (
            <div className="flex justify-center mb-2">
              <button 
                onClick={() => setIsExpanded(true)}
                className="bg-gray-900/30 backdrop-blur-xl p-2 rounded-full border border-purple-500/20"
              >
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="bg-gray-900/30 backdrop-blur-xl p-4 rounded-t-2xl border border-purple-500/20 flex flex-col">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-center space-x-3">
                {isMember ? (
                  <>
                    <button
                      onClick={() => setShowChat(true)}
                      className="flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat
                    </button>
                    <button
                      onClick={handleDemoButton}
                      className="flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Canvas
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleJoinForum}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Join Forum
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(8px)',
          },
        }}
      />
      {renderConnectionStatus()}
    </div>
  );
};

export default ForumDiscussion;