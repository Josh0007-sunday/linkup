import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LinkUpCarousel from "../addon/LinkupCarousel";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { FaCopy, FaCheck } from "react-icons/fa";

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
  publicKey?: string;
  eth_publickey?: string;
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

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-purple-500/20 transition-colors group relative"
    >
      {copied ? (
        <FaCheck className="text-green-400" />
      ) : (
        <FaCopy className="text-gray-400 group-hover:text-purple-400" />
      )}
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </span>
    </button>
  );
};

const ViewAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [bioFilter, setBioFilter] = useState<string>("");

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedUser(null); // Reset selected user when changing pages
  };

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
    
    if (statusFilter !== "all") {
      result = result.filter(user => user.status === statusFilter);
    }
    
    if (ratingFilter !== null) {
      result = result.filter(user => 
        user.averageRating !== undefined && user.averageRating >= ratingFilter
      );
    }
    
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

  const statusOptions = ["all", ...new Set(users.map(user => user.status).filter(Boolean))];

  const resetFilters = () => {
    setStatusFilter("all");
    setRatingFilter(null);
    setBioFilter("");
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-[1920px] mx-auto">
        <button
          onClick={() => navigate("/homepage")}
          className="mb-6 px-4 py-2 text-sm text-purple-400 bg-black/40 backdrop-blur-xl rounded-md hover:bg-purple-500/20 border border-purple-500/20 transition-all duration-300"
        >
          ← Back
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Filters (30%) */}
          <div className="w-full lg:w-[30%]">
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Filters</h2>
                </div>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Reset
          </button>
        </div>

              <div className="space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-purple-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-purple-500/50"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                        className={`p-2 rounded-full ${ratingFilter && ratingFilter <= star ? 'bg-purple-500/20' : 'bg-black/40'} hover:bg-purple-500/20 transition-colors`}
                    >
                      <span className={`text-lg ${ratingFilter && star <= ratingFilter ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio Contains</label>
                <div className="flex">
                  <input
                    type="text"
                    value={bioFilter}
                    onChange={(e) => setBioFilter(e.target.value)}
                    placeholder="Search bios..."
                      className="flex-1 px-3 py-2 bg-black/40 border border-purple-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                  {bioFilter && (
                    <button
                      onClick={() => setBioFilter("")}
                        className="px-3 py-2 bg-black/40 text-gray-500 hover:text-gray-300 border-t border-r border-b border-purple-500/20 rounded-r-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
              </div>
          </div>

          {/* Middle Column - Users Table (40%) */}
          <div className="w-full lg:w-[40%]">
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
                Users List
              </h2>

        {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="bg-black/40 p-4 rounded-lg border border-purple-500/20">
                      <LoadingSkeleton type="text" className="w-3/4 mb-2" />
                      <LoadingSkeleton type="text" className="w-1/2" />
              </div>
            ))}
          </div>
        ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="text-left border-b border-purple-500/20">
                          <th className="pb-3 text-gray-300 font-medium">User</th>
                          <th className="pb-3 text-gray-300 font-medium">Email</th>
                          <th className="pb-3 text-gray-300 font-medium">Public Key</th>
                          <th className="pb-3 text-gray-300 font-medium">ETH Key</th>
                          <th className="pb-3 text-gray-300 font-medium">Bio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((user) => (
                          <tr 
                    key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`border-b border-purple-500/20 cursor-pointer hover:bg-purple-500/10 transition-colors ${
                              selectedUser?._id === user._id ? 'bg-purple-500/20' : ''
                            }`}
                  >
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {getImageUrl(user.img) ? (
                            <img 
                                      src={getImageUrl(user.img)!} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                              }}
                            />
                          ) : (
                                    <span className="text-lg font-bold text-purple-400">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                                <span className="text-gray-300">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-300">{user.email}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 text-sm font-mono max-w-[120px] truncate">
                                  {user.publicKey || 'N/A'}
                                </span>
                                {user.publicKey && <CopyButton text={user.publicKey} />}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 text-sm font-mono max-w-[120px] truncate">
                                  {user.eth_publickey || 'N/A'}
                                </span>
                                {user.eth_publickey && <CopyButton text={user.eth_publickey} />}
                              </div>
                            </td>
                            <td className="py-3 text-gray-300 max-w-[150px] truncate">
                              {user.bio || "No bio available"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-400">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm text-purple-400 bg-black/40 border border-purple-500/20 rounded-md hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              currentPage === index + 1
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'text-gray-400 bg-black/40 border border-purple-500/20 hover:bg-purple-500/20'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm text-purple-400 bg-black/40 border border-purple-500/20 rounded-md hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - User Details (30%) */}
          <div className="w-full lg:w-[30%]">
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              {selectedUser ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center overflow-hidden">
                      {getImageUrl(selectedUser.img) ? (
                        <img 
                          src={getImageUrl(selectedUser.img)!} 
                          alt={selectedUser.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`;
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-purple-400">
                          {selectedUser.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-400">{selectedUser.status || "Professional"}</p>
                      {selectedUser.averageRating !== undefined && selectedUser.averageRating > 0 && (
                          <div className="mt-1">
                          <StarRating rating={selectedUser.averageRating} />
                          </div>
                        )}
                      </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Email</h4>
                      <p className="text-gray-400">{selectedUser.email}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Bio</h4>
                      <p className="text-gray-400">{selectedUser.bio || "No bio available"}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Social Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          selectedUser.github_url && { name: "GitHub", color: "bg-gray-800 text-white" },
                          selectedUser.linkedin_url && { name: "LinkedIn", color: "bg-blue-600 text-white" },
                          selectedUser.twitter_url && { name: "Twitter", color: "bg-blue-400 text-white" },
                          selectedUser.facebook_url && { name: "Facebook", color: "bg-blue-800 text-white" },
                          selectedUser.portfolio && { name: "Portfolio", color: "bg-purple-500/20 text-purple-400" },
                        ]
                          .filter(Boolean)
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

                    <button
                      onClick={() => navigate(`/main/userdetails/${selectedUser._id}`)}
                      className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
            ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-300">Select a User</h3>
                  <p className="mt-1 text-gray-500">Click on a user from the list to view their details</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllUsers;