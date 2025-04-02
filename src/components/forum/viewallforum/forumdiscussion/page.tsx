import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import AudioSpace from "./space/page";

interface Attendee {
  user: string | { _id: string }; // User ID
  name: string;
  img: string;
  status: string;
}

interface Forum {
  _id: string;
  name: string;
  description: string;
  imageUri: string; // Forum image
  creator: string; // Creator ID
  creatorName: string;
  creatorImg: string; // Creator image
  creatorStatus: string; // Creator status
  attendees: Attendee[]; // Array of attendee objects
  messages: {
    sender: string;
    senderName: string;
    senderImg: string;
    content: string;
    timestamp: Date;
  }[];
  isPublic: boolean;
  space?: { // Make it optional with ?
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
  // const { forumId } = useParams();
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const API_BASE_URL = import.meta.env.VITE_CONNECTION;
  // const token = localStorage.getItem("auth-token");
  const token = localStorage.getItem("auth-token") || "";
  const [isCreator, setIsCreator] = useState(false);

  // Get the current user's ID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;

  // Function to get the full image URL
  const getImageUrl = (img: string | null | undefined, defaultImg: string): string => {
    if (!img) return defaultImg;
    return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
  };

  // Default image URLs
  const DEFAULT_USER_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/010/260/479/small/default-avatar-profile-icon-of-social-media-user-in-clipart-style-vector.jpg";
  useEffect(() => {
    const fetchForumDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/forum/${forumId}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        const forumData = response.data;
        setForum(forumData);

        // Check if the current user is the creator
        const creatorId = typeof forumData.creator === 'object'
          ? forumData.creator._id
          : forumData.creator;
        const userIsCreator = creatorId.toString() === userId;
        setIsCreator(userIsCreator);

        // Check if the current user is an attendee
        const isAttendee = forumData.attendees.some((attendee: Attendee) => {
          if (typeof attendee.user === 'object' && attendee.user !== null) {
            return attendee.user._id.toString() === userId;
          } else {
            return attendee.user.toString() === userId;
          }
        });

        setIsMember(userIsCreator || isAttendee);
      } catch (error) {
        console.error("Error fetching forum details:", error);
        setError("Failed to load forum details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchForumDetails();
  }, [forumId, userId, token, API_BASE_URL]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${forumId}/message`,
        { content: message },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setMessage("");
        // Refresh forum details to show the new message
        const updatedResponse = await axios.get(`${API_BASE_URL}/forum/${forumId}`, {
          headers: {
            "x-auth-token": token,
          },
        });
        setForum(updatedResponse.data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message. Please try again.");
    }
  };

  // Handle joining the forum
  const handleJoinForum = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${forumId}/join`,
        null,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("You have joined the forum successfully!");

        // Fetch updated forum details
        const updatedResponse = await axios.get(`${API_BASE_URL}/forum/${forumId}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        // Update the forum state
        setForum(updatedResponse.data);

        // Recalculate isMember based on the updated forum state
        const isCreator = updatedResponse.data.creator.toString() === userId;
        const isAttendee = updatedResponse.data.attendees.some(
          (attendee: Attendee) => attendee.user.toString() === userId
        );
        setIsMember(isCreator || isAttendee);
      }
    } catch (error) {
      console.error("Error joining forum:", error);
      toast.error("An error occurred while joining the forum. Please try again.");
    }
  };

  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    if (!forum?.messages.length) return [];

    const grouped: { date: string; messages: typeof forum.messages }[] = [];

    forum.messages.forEach(msg => {
      const messageDate = new Date(msg.timestamp).toLocaleDateString();
      const existingGroup = grouped.find(group => group.date === messageDate);

      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        grouped.push({ date: messageDate, messages: [msg] });
      }
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  // Check if message is from current user
  const isCurrentUser = (senderId: string) => {
    return senderId === userId;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/view-forum")}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-center">
            {forum?.imageUri && (
              <img
                src={getImageUrl(forum.imageUri, DEFAULT_USER_IMAGE)}
                alt={forum.name}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
            )}
            <h1 className="text-xl font-semibold text-gray-800">{forum?.name}</h1>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 ml-2 text-gray-600 hover:text-gray-800 transition-colors md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 pb-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center p-4 bg-red-50 rounded-lg text-red-500 border border-red-100">{error}</div>
            ) : forum?.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">No messages yet</p>
                <p className="text-sm mt-1">Be the first to start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMessages.map((group, groupIdx) => (
                  <div key={groupIdx} className="mb-6">
                    <div className="flex justify-center mb-4">
                      <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                        {new Date(group.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.messages.map((msg, index) => {
                        const userIsSender = isCurrentUser(msg.sender);

                        return (
                          <div
                            key={index}
                            className={`flex ${userIsSender ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${userIsSender ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!userIsSender && (
                                <div className={`flex-shrink-0 ${userIsSender ? 'ml-3' : 'mr-3'}`}>
                                  <img
                                    src={getImageUrl(msg.senderImg, DEFAULT_USER_IMAGE)}
                                    alt={msg.senderName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex flex-col">
                                {!userIsSender && (
                                  <span className="text-xs text-gray-500 mb-1">{msg.senderName}</span>
                                )}

                                <div className="flex items-end">
                                  <div
                                    className={`py-2 px-3 rounded-lg ${userIsSender
                                      ? 'bg-indigo-600 text-white rounded-tr-none'
                                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                      }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                  </div>
                                  <span className={`text-xs text-gray-500 mx-2 mb-1 whitespace-nowrap ${userIsSender ? 'mr-0' : 'ml-0'}`}>
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
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200 bg-white shadow-inner">
            {isMember ? (
              <div className="relative flex items-center">
                <textarea
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-gray-100 text-gray-800 px-4 py-3 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-10 max-h-32"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`absolute right-2 p-2 rounded-full ${message.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    } transition-colors`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleJoinForum}
                  className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Join Forum to Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`w-80 bg-white border-l border-gray-200 flex flex-col fixed md:static right-0 top-0 bottom-0 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} z-10 overflow-hidden`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center md:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Forum Details</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Forum Image */}
            {forum?.imageUri && (
              <div className="p-4">
                <img
                  src={getImageUrl(forum.imageUri, DEFAULT_USER_IMAGE)}
                  alt={forum.name}
                  className="w-full h-32 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Forum Description */}
            <div className="px-4 py-3">
              <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-2">About this forum</h3>
              <p className="text-gray-700 text-sm">{forum?.description || "No description available."}</p>
            </div>

            {/* Forum Creator */}
            <div className="px-4 py-3 border-t border-gray-100">
              <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3">Creator</h3>
              {forum && (
                <div className="flex items-center">
                  <img
                    src={getImageUrl(forum.creatorImg, DEFAULT_USER_IMAGE)}
                    alt={forum.creatorName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{forum.creatorName}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <p className="text-xs text-gray-500">{forum.creatorStatus || "Online"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Members List */}
            <div className="px-4 py-3 border-t border-gray-100">
              <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Members ({forum?.attendees.length || 0})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {forum?.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <img
                      src={getImageUrl(attendee.img, DEFAULT_USER_IMAGE)}
                      alt={attendee.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{attendee.name}</p>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full ${attendee.status === "online" ? "bg-green-500" :
                          attendee.status === "away" ? "bg-yellow-400" : "bg-gray-300"
                          } mr-1`}></div>
                        <p className="text-xs text-gray-500 capitalize">{attendee.status || "offline"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/**render the audio here */}
            {forumId && (
              <AudioSpace
                forumId={forumId}
                isCreator={isCreator}
                token={token}
              />
            )}
       

              {/* Join button for mobile view */}
              {!isMember && (
                <div className="p-4 mt-auto border-t border-gray-200">
                  <button
                    onClick={handleJoinForum}
                    className="w-full py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Join Forum
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default ForumDiscussion;