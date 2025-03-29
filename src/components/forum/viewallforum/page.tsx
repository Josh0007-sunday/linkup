// import { useEffect, useState } from "react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// interface Forum {
//   _id: string;
//   name: string;
//   description: string;
//   creatorName: string;
//   attendees: string[]; // Array of attendee IDs
//   isPublic: boolean;
// }

// const Spinner = () => {
//   return (
//     <div className="flex justify-center items-center h-64">
//       <div className="relative">
//         <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-100"></div>
//         <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-gray-400 border-t-transparent"></div>
//       </div>
//     </div>
//   );
// };

// const ViewPublicForums = () => {
//   const [forums, setForums] = useState<Forum[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   const API_BASE_URL = import.meta.env.VITE_CONNECTION;
//   const token = localStorage.getItem("auth-token");

//   // Get the current user's ID from localStorage
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const userId = user._id;

//   useEffect(() => {
//     const fetchPublicForums = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`${API_BASE_URL}/public`);
//         setForums(response.data);
//         setError(null);
//       } catch (error) {
//         console.error("Error fetching public forums:", error);
//         setError("Failed to load public forums. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPublicForums();
//   }, []);

//   const handleJoinForum = async (forumId: string) => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/${forumId}/join`,
//         null,
//         {
//           headers: {
//             "x-auth-token": token,
//           },
//         }
//       );

//       if (response.data.error) {
//         toast.error(response.data.error);
//       } else {
//         toast.success("You have joined the forum successfully!");
//         // Refresh the forums list to update the attendees
//         const updatedResponse = await axios.get(`${API_BASE_URL}/public`);
//         setForums(updatedResponse.data);
//       }
//     } catch (error) {
//       console.error("Error joining forum:", error);
//       toast.error("An error occurred while joining the forum. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         <button
//           onClick={() => navigate("/homepage")}
//           className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
//         >
//           ← Back
//         </button>

//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Public Forums</h1>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <Spinner />
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {forums.length > 0 ? (
//               forums.map((forum) => {
//                 // Check if the current user is already an attendee
//                 const isJoined = forum.attendees.includes(userId);

//                 return (
//                   <div
//                     key={forum._id}
//                     className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
//                   >
//                     <div className="flex items-center mb-6">
//                       <div className="relative">
//                         <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
//                           <span className="text-2xl font-bold text-blue-600">
//                             {forum.name.charAt(0)}
//                           </span>
//                         </div>
//                         <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
//                       </div>
//                       <div className="ml-4">
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           {forum.name}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           Created by: {forum.creatorName}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <p className="text-sm text-gray-600 leading-relaxed">
//                         {forum.description}
//                       </p>
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-500">
//                           {forum.attendees.length} attendees
//                         </span>
//                         {isJoined ? (
//                           // If already joined, show "View Forum" button
//                           <button
//                             onClick={() => navigate(`/${forum._id}/message`)}
//                             className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-400"
//                           >
//                             View Forum
//                           </button>
//                         ) : (
//                           // If not joined, show "Join Forum" button
//                           <button
//                             onClick={() => handleJoinForum(forum._id)}
//                             className="px-4 py-2 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-500"
//                           >
//                             Join Forum
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="col-span-3 text-center py-8 text-gray-500">
//                 No public forums found. Check back later.
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//       <Toaster position="top-center" />
//     </div>
//   );
// };

// export default ViewPublicForums;

import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AUTH/page"; // Import your auth context

interface Attendee {
    user: string; // User ID
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
    isPublic: boolean;
}

const Spinner = () => {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="relative">
                <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-100"></div>
                <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-gray-400 border-t-transparent"></div>
            </div>
        </div>
    );
};

const ViewPublicForums = () => {
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth(); // Use the auth context to get current user

    const API_BASE_URL = import.meta.env.VITE_CONNECTION;
    const token = localStorage.getItem("auth-token");

    // Get the current user's ID either from context or localStorage as fallback
    const userId = user?._id || JSON.parse(localStorage.getItem("user") || "{}")._id;

    useEffect(() => {
        const fetchPublicForums = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/public`);
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
    }, [API_BASE_URL]);

    const handleJoinForum = async (forumId: string) => {
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
                // Refresh the forums list to update the attendees
                const updatedResponse = await axios.get(`${API_BASE_URL}/public`);
                setForums(updatedResponse.data);
            }
        } catch (error: any) {
            console.error("Error joining forum:", error);
            const errorMessage = error.response?.data?.error || "An error occurred while joining the forum. Please try again.";
            toast.error(errorMessage);
        }
    };

    // Function to get default image if the provided one is null or undefined
    const getImageUrl = (img: string | null | undefined, defaultImg: string): string => {
        return img || defaultImg;
    };

    // Default image URLs
    const DEFAULT_FORUM_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKTAXELs-l5c7qeTe3jbUgK9S4f-hYQWWi8A&s";
    const DEFAULT_USER_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/010/260/479/small/default-avatar-profile-icon-of-social-media-user-in-clipart-style-vector.jpg";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate("/homepage")}
                    className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Public Forums</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forums.length > 0 ? (
                            forums.map((forum) => {
                                // Check if the current user is already an attendee
                                const isJoined = forum.attendees.some(
                                    (attendee) => attendee.user === userId
                                );

                                return (
                                    <div
                                        key={forum._id}
                                        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                                    >
                                        {/* Forum Image */}
                                        <div className="mb-6">
                                            <img
                                                src={forum.imageUri} // Use the Blob URL directly
                                                alt={forum.name}
                                                className="w-full h-32 object-cover rounded-lg"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = DEFAULT_FORUM_IMAGE; // Fallback to a default image if the Blob URL fails
                                                }}
                                            />
                                        </div>

                                        {/* Creator Details */}
                                        <div className="flex items-center mb-6">
                                            <img
                                                src={getImageUrl(`${API_BASE_URL}${forum.creatorImg}`, DEFAULT_USER_IMAGE)} // Correct URL construction
                                                alt={forum.creatorName}
                                                className="w-10 h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = DEFAULT_USER_IMAGE;
                                                }}
                                            />
                                            <div className="ml-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {forum.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Created by: {forum.creatorName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {forum.description}
                                            </p>

                                            {/* Attendees Count */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">
                                                    {forum.attendees.length} attendees
                                                </span>

                                                {/* Join/View Button */}
                                                {isJoined ? (
                                                    <button
                                                        onClick={() => navigate(`/${forum._id}/message`)}
                                                        className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600"
                                                    >
                                                        View Forum
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoinForum(forum._id)}
                                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                    >
                                                        Join Forum
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-3 text-center py-8 text-gray-500">
                                No public forums found. Check back later.
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

export default ViewPublicForums;