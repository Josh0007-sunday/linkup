import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { FaFilter, FaSearch, FaDollarSign, FaCode, FaClock } from "react-icons/fa";

interface Job {
  _id: string;
  imageUri: string;
  title: string;
  projectname: string;
  price_minimum: number;
  price_maximum: number;
  method: string;
  stack: string[];
}

const ViewAllJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(10000);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("Any time");
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getJobs`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
        setError(null);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleTechChange = (tech: string) => {
    setSelectedTech(prev => {
      const newSelection = prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech];
      return newSelection;
    });
  };

  const applyFilters = () => {
    console.log('Applying filters:', { searchTerm, priceRange, selectedTech, timeFilter });
    
    let filtered = [...jobs];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.projectname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange < 10000) {
      filtered = filtered.filter(job => 
        job.price_maximum <= priceRange
      );
    }

    // Tech stack filter
    if (selectedTech.length > 0) {
      filtered = filtered.filter(job =>
        selectedTech.some(tech => 
          job.stack.some(jobTech => 
            jobTech.toLowerCase() === tech.toLowerCase()
          )
        )
      );
    }

    // Time filter (mock implementation)
    if (timeFilter !== "Any time") {
      // This is a mock implementation - replace with actual timestamp comparison
      // For now, we'll just return all jobs
      console.log('Time filter selected:', timeFilter);
    }

    console.log('Filtered jobs:', filtered);
    setFilteredJobs(filtered);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, priceRange, selectedTech, timeFilter]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setPriceRange(10000);
    setSelectedTech([]);
    setTimeFilter("Any time");
    setFilteredJobs(jobs);
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate("/homepage")}
          className="mb-6 px-4 py-2 text-sm text-purple-400 bg-black/40 backdrop-blur-xl rounded-md hover:bg-purple-500/20 border border-purple-500/20 transition-all duration-300"
        >
          ← Back
        </button>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Filter Card (30%) */}
          <div className="w-full lg:w-[30%]">
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-purple-400" />
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Filters</h2>
                </div>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Reset
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/20 rounded-lg px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                  <FaSearch className="absolute right-3 top-3 text-gray-500" />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-gray-300 mb-3 flex items-center gap-2">
                  <FaDollarSign className="text-purple-400" />
                  Price Range
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>$0</span>
                    <span>${priceRange.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Tech Stack Filter */}
              <div className="mb-6">
                <h3 className="text-gray-300 mb-3 flex items-center gap-2">
                  <FaCode className="text-purple-400" />
                  Tech Stack
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['React', 'Node.js', 'Python', 'Solidity', 'Rust'].map((tech) => (
                    <label key={tech} className="flex items-center gap-2 text-gray-300 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={selectedTech.includes(tech)}
                        onChange={() => handleTechChange(tech)}
                        className="accent-purple-500" 
                      />
                      {tech}
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Filter */}
              <div className="mb-6">
                <h3 className="text-gray-300 mb-3 flex items-center gap-2">
                  <FaClock className="text-purple-400" />
                  Time Posted
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Last 24 hours', 'Last week', 'Last month', 'Any time'].map((time) => (
                    <label key={time} className="flex items-center gap-2 text-gray-300 cursor-pointer text-sm">
                      <input 
                        type="radio" 
                        name="time" 
                        checked={timeFilter === time}
                        onChange={() => setTimeFilter(time)}
                        className="accent-purple-500" 
                      />
                      {time}
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <button 
                onClick={applyFilters}
                className="w-full bg-purple-500/20 text-purple-400 py-2 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Right Side - Jobs List (70%) */}
          <div className="w-full lg:w-[70%]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                All Jobs
              </h1>
              <span className="text-gray-400 text-sm sm:text-base">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </span>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-purple-500/20 flex gap-4">
                    <LoadingSkeleton type="image" className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg" />
                    <div className="flex-1">
                      <div className="mb-2">
                        <LoadingSkeleton type="text" className="w-3/4" />
                      </div>
                      <div className="mb-2">
                        <LoadingSkeleton type="text" className="w-1/2" />
                      </div>
                      <div className="mb-2">
                        <LoadingSkeleton type="text" className="w-32" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((techIndex) => (
                          <LoadingSkeleton key={techIndex} type="text" className="w-20" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group flex gap-4"
                      onClick={() => navigate(`/main/jobdetails/${job._id}`)}
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative overflow-hidden rounded-lg flex-shrink-0">
                        <img
                          src={job.imageUri}
                          alt={job.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2 truncate">{job.projectname}</p>
                        <div className="flex items-center text-purple-400 mb-2">
                          <span className="text-sm">
                            ${job.price_minimum.toLocaleString()} - ${job.price_maximum.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 mb-2">
                          <span className="text-sm">{job.method}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.stack.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs sm:text-sm border border-purple-500/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No jobs found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllJobs;