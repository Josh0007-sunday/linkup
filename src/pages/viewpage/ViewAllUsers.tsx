import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LinkUpCarousel from "../addon/LinkupCarousel";
import LoadingSkeleton from "../../components/LoadingSkeleton";

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
  averageRating?: number;
  reviewCount?: number;
}
// @ts-ignore
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

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400 text-lg">½</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
      ))}
      <span className="ml-1 text-sm text-gray-500">({rating.toFixed(1)})</span>
    </div>
  );
};

const ViewAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [bioFilter, setBioFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
        
        const usersWithRatings = await Promise.all(
          data.users.map(async (user: User) => {
            try {
              const ratingResponse = await fetch(`${API_BASE_URL}/users/${user._id}/average-rating`);
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                return {
                  ...user,
                  averageRating: ratingData.averageRating || 0,
                  reviewCount: ratingData.reviewCount || 0
                };
              }
              return {
                ...user,
                averageRating: 0,
                reviewCount: 0
              };
            } catch (error) {
              console.error(`Error fetching rating for user ${user._id}:`, error);
              return {
                ...user,
                averageRating: 0,
                reviewCount: 0
              };
            }
          })
        );

        setUsers(usersWithRatings);
        setFilteredUsers(usersWithRatings);
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

  useEffect(() => {
    let result = [...users];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply rating filter
    if (ratingFilter !== null) {
      result = result.filter(user => 
        user.averageRating !== undefined && user.averageRating >= ratingFilter
      );
    }
    
    // Apply bio filter
    if (bioFilter.trim() !== "") {
      const searchTerm = bioFilter.toLowerCase();
      result = result.filter(user => 
        user.bio && user.bio.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredUsers(result);
  }, [statusFilter, ratingFilter, bioFilter, users]);

  const getImageUrl = (imgPath: string) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  // Extract unique statuses for filter options
  const statusOptions = ["all", ...new Set(users.map(user => user.status).filter(Boolean))];

  const resetFilters = () => {
    setStatusFilter("all");
    setRatingFilter(null);
    setBioFilter("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <LinkUpCarousel />

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/homepage")}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Our Community Members</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                      className={`p-2 rounded-full ${ratingFilter && ratingFilter <= star ? 'bg-yellow-100' : 'bg-gray-100'} hover:bg-yellow-100 transition-colors`}
                    >
                      <span className={`text-lg ${ratingFilter && star <= ratingFilter ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    </button>
                  ))}
                  {ratingFilter && (
                    <button 
                      onClick={() => setRatingFilter(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio Contains</label>
                <div className="flex">
                  <input
                    type="text"
                    value={bioFilter}
                    onChange={(e) => setBioFilter(e.target.value)}
                    placeholder="Search bios..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {bioFilter && (
                    <button
                      onClick={() => setBioFilter("")}
                      className="px-3 py-2 bg-gray-100 text-gray-500 hover:text-gray-700 border-t border-r border-b border-gray-300 rounded-r-md"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {(statusFilter !== "all" || ratingFilter !== null || bioFilter) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <LoadingSkeleton type="profile" className="w-16 h-16" />
                  <div className="ml-4 flex-1">
                    <LoadingSkeleton type="text" className="w-32 mb-2" />
                    <LoadingSkeleton type="text" className="w-24" />
                  </div>
                </div>
                <LoadingSkeleton type="text" className="w-full mb-3" />
                <div className="flex gap-2">
                  <LoadingSkeleton type="text" className="w-20" />
                  <LoadingSkeleton type="text" className="w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const profileImageUrl = getImageUrl(user.img);
                return (
                  <div
                    key={user._id}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group"
                    onClick={() => navigate(`/main/userdetails/${user._id}`)}
                  >
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center overflow-hidden">
                          {profileImageUrl ? (
                            <img 
                              src={profileImageUrl} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                              }}
                            />
                          ) : (
                            <span className="text-2xl font-bold text-blue-600">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {user.status || "Professional"}
                        </p>
                        {user.averageRating !== undefined && user.averageRating > 0 && (
                          <div className="mt-1">
                            <StarRating rating={user.averageRating} />
                            <span className="text-xs text-gray-500 ml-1">
                              {user.reviewCount} {user.reviewCount === 1 ? 'review' : 'reviews'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {user.bio || "No bio available"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          user.github_url && { name: "GitHub", color: "bg-gray-800 text-white" },
                          user.linkedin_url && { name: "LinkedIn", color: "bg-blue-600 text-white" },
                          user.twitter_url && { name: "Twitter", color: "bg-blue-400 text-white" },
                          user.facebook_url && { name: "Facebook", color: "bg-blue-800 text-white" },
                          user.portfolio && { name: "Portfolio", color: "bg-blue-100 text-blue-600" },
                        ]
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((social, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-full text-xs ${(social as { color: string }).color}`}
                            >
                              {(social as { name: string }).name}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No users match your filters</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search criteria</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllUsers;