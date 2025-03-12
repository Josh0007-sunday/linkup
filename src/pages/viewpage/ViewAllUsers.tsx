import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const ViewAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

   const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getUsers`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.users);
        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate("/homepage")}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Users</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/main/userdetails/${user._id}`)}
                >
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.status || "Professional"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        user.github_url && "GitHub",
                        user.linkedin_url && "LinkedIn",
                        user.twitter_url && "Twitter",
                        user.facebook_url && "Facebook",
                        user.portfolio && "Portfolio",
                      ]
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((social, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                          >
                            {social}
                          </span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {user.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No users found. Check back later.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllUsers;