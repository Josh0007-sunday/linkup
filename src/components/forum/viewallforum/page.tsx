import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AUTH/page";
import { FaEye, FaTrash, FaLock } from "react-icons/fa";
import LinkUpCarousel from "../../../pages/addon/LinkupCarousel";

interface Attendee {
    user: string;
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
    isPublic: boolean;
    passcode?: string;
}

const Spinner = () => {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="relative">
                <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-purple-500/20"></div>
                <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-purple-500 border-t-transparent"></div>
            </div>
        </div>
    );
};

const ViewPublicForums = () => {
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
    const [passcode, setPasscode] = useState("");
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const API_BASE_URL = import.meta.env.VITE_CONNECTION;
    const token = localStorage.getItem("auth-token");
    const userId = user?._id || JSON.parse(localStorage.getItem("user") || "{}")._id;

    useEffect(() => {
        const fetchPublicForums = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/public`, {
                    headers: {
                        "x-auth-token": token,
                    },
                });
                setForums(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching public forums:", error);
                setError("Failed to load public forums. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicForums();
    }, [API_BASE_URL, token]);

    const handleJoinForum = async (forumId: string, providedPasscode?: string) => {
        setIsJoining(true);
        try {
            await axios.post(
                `${API_BASE_URL}/${forumId}/join`,
                { passcode: providedPasscode },
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );

            toast.success("You have joined the forum successfully!");
            navigate(`/${forumId}/message`);
        } catch (error: any) {
            console.error("Error joining forum:", error);
            const errorMessage =
                error.response?.data?.error ||
                "An error occurred while joining the forum. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsJoining(false);
            setShowPasscodeModal(false);
            setPasscode("");
            setSelectedForum(null);
        }
    };

    const handleDeleteForum = async (forumId: string) => {
        if (!confirm("Are you sure you want to delete this forum? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(forumId);
        try {
            await axios.delete(`${API_BASE_URL}/forum/${forumId}`, {
                headers: {
                    "x-auth-token": token,
                },
            });

            toast.success("Forum deleted successfully!");
            setForums(forums.filter((forum) => forum._id !== forumId));
        } catch (error: any) {
            console.error("Error deleting forum:", error);
            const errorMessage = error.response?.data?.error ||
                "An error occurred while deleting the forum. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleJoinClick = (forum: Forum) => {
        setSelectedForum(forum);
        if (forum.passcode) {
            setShowPasscodeModal(true);
        } else {
            handleJoinForum(forum._id);
        }
    };

    const handlePasscodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedForum) {
            handleJoinForum(selectedForum._id, passcode);
        }
    };

    const getImageUrl = (img: string | null | undefined, defaultImg: string): string => {
        if (!img) return defaultImg;
        if (img.startsWith("http://") || img.startsWith("https://")) {
            return img;
        }
        return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    };

    const DEFAULT_FORUM_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKTAXELs-l5c7qeTe3jbUgK9S4f-hYQWWi8A&s";
    // const DEFAULT_USER_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/010/260/479/small/default-avatar-profile-icon-of-social-media-user-in-clipart-style-vector.jpg";

    return (
        <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black p-6 sm:p-8">
            <LinkUpCarousel />

            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate("/homepage")}
                    className="mb-6 flex items-center px-4 py-2 text-sm font-medium text-purple-300 bg-gray-900/30 backdrop-blur-xl rounded-lg border border-purple-500/20 hover:bg-purple-500/10 transition-colors"
                >
                    <span className="mr-2">←</span> Back
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient-x mb-8">Public Forums</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forums.length > 0 ? (
                            forums.map((forum) => {
                                const isJoined = forum.attendees.some(
                                    (attendee) => attendee.user === userId
                                );
                                const isCreator = forum.creator === userId;

                                return (
                                    <div
                                        key={forum._id}
                                        className="bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                                    >
                                        <div className="mb-4">
                                            <img
                                                src={getImageUrl(forum.imageUri, DEFAULT_FORUM_IMAGE)}
                                                alt={forum.name}
                                                className="w-full h-40 object-cover rounded-lg border border-purple-500/20"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = DEFAULT_FORUM_IMAGE;
                                                }}
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-purple-300 truncate">
                                                {forum.name}
                                            </h3>
                                            <p className="text-sm text-purple-400/70 mt-1">
                                                Created by: {forum.creatorName}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm text-purple-300/80 line-clamp-3">
                                                {forum.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-purple-400/70">
                                                    <span>{forum.attendees.length} attendees</span>
                                                    {forum.passcode && (
                                                        <span className="ml-2 flex items-center text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20">
                                                            <FaLock className="mr-1" /> Protected
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex space-x-2">
                                                    {isJoined ? (
                                                        <button
                                                            onClick={() => navigate(`/${forum._id}/message`)}
                                                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-500/50 disabled:cursor-not-allowed"
                                                        >
                                                            <FaEye className="mr-2" /> View
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleJoinClick(forum)}
                                                            disabled={isJoining}
                                                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-500/50 disabled:cursor-not-allowed"
                                                        >
                                                            {isJoining ? (
                                                                "Joining..."
                                                            ) : (
                                                                <>
                                                                    <FaEye className="mr-2" /> Join
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {isCreator && (
                                                        <button
                                                            onClick={() => handleDeleteForum(forum._id)}
                                                            disabled={isDeleting === forum._id}
                                                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-500/50 disabled:cursor-not-allowed"
                                                        >
                                                            {isDeleting === forum._id ? (
                                                                "Deleting..."
                                                            ) : (
                                                                <>
                                                                    <FaTrash className="mr-2" /> Delete
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-3 text-center py-8 text-purple-300/70">
                                No public forums found. Check back later.
                            </div>
                        )}
                    </div>
                )}

                {showPasscodeModal && selectedForum && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 shadow-2xl max-w-md w-full">
                            <h3 className="text-lg font-semibold text-purple-300 mb-2">Enter Passcode</h3>
                            <p className="text-sm text-purple-400/70 mb-4">
                                This forum requires a passcode to join.
                            </p>
                            <form onSubmit={handlePasscodeSubmit}>
                                <input
                                    type="text"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg text-purple-300 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 mb-4"
                                    placeholder="Enter passcode"
                                    autoFocus
                                    required
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasscodeModal(false);
                                            setPasscode("");
                                            setSelectedForum(null);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-purple-300 bg-gray-800/50 rounded-lg border border-purple-500/20 hover:bg-purple-500/10 transition-colors disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                                        disabled={isJoining}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-500/50 disabled:cursor-not-allowed"
                                        disabled={isJoining}
                                    >
                                        {isJoining ? "Joining..." : "Join Forum"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <Toaster 
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            backdropFilter: 'blur(8px)',
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default ViewPublicForums;