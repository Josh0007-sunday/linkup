import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface User {
  img: string;
  portfolio: string;
  github_url: string;
  linkedin_url: string;
  facebook_url: string;
  twitter_url: string;
  bio: string;
  status: string;
  name: string;
  email: string;
  _id: string;
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

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getUser/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data.users); // Set the user data
        setError(null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back
        </button>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Spinner />
        ) : user ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header with gradient background */}
            <div className="h-32 bg-gradient-to-r from-gray-700 to-gray-900"></div>
            
            {/* Profile section */}
            <div className="px-8 py-6 -mt-16">
              {/* Avatar */}
              <div className="flex flex-col md:flex-row items-center md:items-end">
                <div className="relative z-10">
                  <div className="w-32 h-32 bg-white p-2 rounded-full shadow-md">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-blue-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                
                {/* Name and status */}
                <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.status || "Professional"}</p>
                  <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                </div>
              </div>
              
              {/* Bio */}
              <div className="mt-8 pb-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {user.bio || "No bio available"}
                </p>
              </div>
              
              {/* Social links */}
              <div className="py-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.portfolio && (
                    <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">🔗</span>
                      <span className="ml-3 text-gray-700">Portfolio</span>
                    </a>
                  )}
                  {user.github_url && (
                    <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-white text-sm">GH</span>
                      <span className="ml-3 text-gray-700">GitHub</span>
                    </a>
                  )}
                  {user.linkedin_url && (
                    <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white text-sm">in</span>
                      <span className="ml-3 text-gray-700">LinkedIn</span>
                    </a>
                  )}
                  {user.twitter_url && (
                    <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-400 rounded-full text-white text-sm">X</span>
                      <span className="ml-3 text-gray-700">Twitter</span>
                    </a>
                  )}
                  {user.facebook_url && (
                    <a href={user.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-800 rounded-full text-white text-sm">f</span>
                      <span className="ml-3 text-gray-700">Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">User not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;