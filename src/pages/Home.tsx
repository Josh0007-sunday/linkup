import { useEffect, useState } from "react";
import { useAuth } from "../components/AUTH/page"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";
import ProfileUpdatePopup from "./addon/ProfileUpdatePopup";
import LinkUpCarousel from "./addon/LinkupCarousel";
import LoadingSkeleton from "../components/LoadingSkeleton";
// Define the User type (same as in your AuthContext)
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

// Define the Article type
interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    img: string;
    _id: string;
  };
  publishedAt: string;
  views: number;
  likesCount: number;
}

// Define the Job type
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

// Define the MarketingPitch type
interface MarketingPitch {
  _id: string;
  heroBannerImage: string;
  profileImage: string;
  nameOrCompany: string;
  briefBio: string;
}

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

// Add this custom skeleton component at the top of the file, after imports
const TalentSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 p-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-500/30 border border-black rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse"></div>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="w-3 h-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const { user: authUser } = useAuth(); // Renamed to avoid conflict with the users state
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]); // All users fetched from the backend
  const [featuredProfiles, setFeaturedProfiles] = useState<User[]>([]); // 3 random profiles to display
  const [jobs, setJobs] = useState<Job[]>([]); // All jobs fetched from the backend
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]); // 3 random jobs to display
  const [marketingPitch, setMarketingPitch] = useState<MarketingPitch | null>(null); // Marketing pitch
  const [showPopup, setShowPopup] = useState(true);
  // @ts-ignore
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState({
    users: true,
    jobs: true,
    pitch: true,
    articles: true
  });

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const getImageUrl = (imgPath: string | undefined | null): string | null => {
    if (!imgPath) return null;
    if (typeof imgPath !== 'string') return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  // Add getTechColor function inside the component
  const getTechColor = (tech: string) => {
    const techColors: Record<string, string> = {
      react: 'bg-purple-500/20 text-purple-300',
      angular: 'bg-pink-500/20 text-pink-300',
      vue: 'bg-green-500/20 text-green-300',
      node: 'bg-blue-500/20 text-blue-300',
      python: 'bg-yellow-500/20 text-yellow-300',
      javascript: 'bg-orange-500/20 text-orange-300',
      typescript: 'bg-indigo-500/20 text-indigo-300',
      aws: 'bg-red-500/20 text-red-300',
      docker: 'bg-cyan-500/20 text-cyan-300',
      kubernetes: 'bg-teal-500/20 text-teal-300',
    };

    const matchingTech = Object.keys(techColors).find((key) => tech.toLowerCase().includes(key));
    return matchingTech ? techColors[matchingTech] : 'bg-purple-500/20 text-purple-300';
  };

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const response = await fetch(`${API_BASE_URL}/getUsers`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        // Fetch ratings for each user
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
        selectRandomProfiles(usersWithRatings);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    fetchUsers();
  }, []);

  // Fetch jobs from the backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getJobs`); // Replace with your backend URL
        console.log("Response:", response); // Log the response

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        const data = await response.json();
        setJobs(data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  // Fetch marketing pitch from the backend
  useEffect(() => {
    const fetchMarketingPitch = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getMarketingPitch`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMarketingPitch(data.pitch); // Store the fetched pitch
      } catch (error) {
        console.error("Error fetching marketing pitch:", error);
      }
    };

    fetchMarketingPitch();
  }, []);

  // Fetch articles from the backend
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(prev => ({ ...prev, articles: true }));
        const response = await fetch(`${API_BASE_URL}/articles/getallarticle`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setArticles(data.articles);
        selectRandomArticles(data.articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(prev => ({ ...prev, articles: false }));
      }
    };
    fetchArticles();
  }, []);

  // Function to select 3 random articles
  const selectRandomArticles = (articles: Article[]) => {
    if (articles.length <= 3) {
      setFeaturedArticles(articles);
    } else {
      const shuffled = [...articles].sort(() => 0.5 - Math.random());
      setFeaturedArticles(shuffled.slice(0, 3));
    }
  };

  // Function to select 3 random profiles
  const selectRandomProfiles = (users: User[]) => {
    if (users.length <= 3) {
      // If there are 3 or fewer users, display all of them
      setFeaturedProfiles(users);
    } else {
      // Randomly select 3 unique profiles
      const shuffled = [...users].sort(() => 0.5 - Math.random());
      setFeaturedProfiles(shuffled.slice(0, 3));
    }
  };

  // Function to select 3 random jobs
  const selectRandomJobs = (jobs: Job[]) => {
    if (jobs.length <= 3) {
      // If there are 3 or fewer jobs, display all of them
      setFeaturedJobs(jobs);
    } else {
      // Randomly select 3 unique jobs
      const shuffled = [...jobs].sort(() => 0.5 - Math.random());
      setFeaturedJobs(shuffled.slice(0, 3));
    }
  };

  // Update featured profiles every 10 seconds
  useEffect(() => {
    if (users.length > 0) {
      selectRandomProfiles(users); // Initial call
      const interval = setInterval(() => selectRandomProfiles(users), 10000); // Update every 10 seconds
      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [users]);

  // Update featured jobs every 10 seconds
  useEffect(() => {
    if (jobs.length > 0) {
      selectRandomJobs(jobs); // Initial call
      const interval = setInterval(() => selectRandomJobs(jobs), 10000); // Update every 10 seconds
      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [jobs]);


  const handleViewTalentClick = () => {
    navigate(`/viewpage/users`);
  };

  const handleViewJobsClick = () => {
    navigate("/viewpage/jobs");
  };

  const handleMarketingClick = () => {
    navigate("/viewpage/marketing-pitches");
  };
  const handleViewArticlesClick = () => {
    navigate("/articles");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Update the renderLoadingState function to include marketing pitch
  const renderLoadingState = (type: 'users' | 'jobs' | 'articles' | 'marketing') => {
    switch (type) {
      case 'users':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <LoadingSkeleton type="profile" />
              </div>
            ))}
          </div>
        );

      case 'jobs':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <LoadingSkeleton type="job" />
              </div>
            ))}
          </div>
        );

      case 'articles':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <LoadingSkeleton type="job" />
              </div>
            ))}
          </div>
        );

      case 'marketing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="space-y-4">
                  <LoadingSkeleton type="image" className="h-48" />
                  <LoadingSkeleton type="text" className="w-3/4" />
                  <LoadingSkeleton type="text" className="w-full" />
                  <LoadingSkeleton type="text" className="w-2/3" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Outfit'] relative overflow-hidden">
      {/* Background Elements */}
      <div className="animated-background" />
      <div className="grid-background" />
      <div className="theme-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {authUser && showPopup && <ProfileUpdatePopup onClose={handleClosePopup} />}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">
            Welcome, {authUser?.name.split(" ")[0]}
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Your gateway to exceptional opportunities and talent
        </p>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Positions", value: "0" },
            { label: "Success Rate", value: "0%" },
            { label: "Avg. Response", value: "48h" },
            { label: "Partners", value: "4+" }
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-sm bg-black/50 rounded-xl border border-purple-500/30 p-4 hover:border-purple-500/60 transition-all duration-300">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <LinkUpCarousel />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - 60% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Job Recommendations Section */}
            <div className="backdrop-blur-sm bg-black/50 rounded-xl  border-purple-500/30 p-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">
                    Job Recommendations
                  </h2>
                  <p className="text-sm text-gray-400">Latest opportunities for you</p>
                </div>
                <button
                  onClick={handleViewJobsClick}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  View all →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 overflow-hidden hover:border-purple-500/60 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <div className="relative h-24">
                      <img
                        src={job.imageUri}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-500/80 backdrop-blur-sm rounded-full text-xs text-white">
                            {job.method}
                          </span>
                          <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white">
                            ${job.price_minimum.toLocaleString()} - ${job.price_maximum.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-white text-sm font-medium mb-1 group-hover:text-purple-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {job.projectname}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {job.stack.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className={`px-1.5 py-0.5 rounded-full text-xs ${getTechColor(tech)}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing Pitch Section */}
            <div className="backdrop-blur-sm bg-black/50 rounded-xl  border-purple-500/30 p-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">
                    Featured Marketing Pitches
                  </h2>
                  <p className="text-sm text-gray-400">Discover top marketing professionals</p>
                </div>
                <button
                  onClick={handleMarketingClick}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  View all →
                </button>
              </div>

              {marketingPitch && (
                <div className=" grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    key={marketingPitch._id}
                    className="group backdrop-blur-sm bg-black/50 rounded-lg overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/viewpage/marketing-pitches/${marketingPitch._id}`)}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={marketingPitch.heroBannerImage}
                        alt="Hero Banner"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <img
                              src={marketingPitch.profileImage}
                              alt="Profile"
                              className="w-8 h-8 rounded-full border border-purple-500/30 object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-black rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-white text-sm font-medium">
                              {marketingPitch.nameOrCompany}
                            </h3>
                            <p className="text-white/90 text-xs">
                              Marketing Professional
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        {marketingPitch.briefBio}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            Featured
                          </span>
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            Marketing
                          </span>
                        </div>
                        <span className="text-purple-400 text-xs group-hover:translate-x-1 transition-transform">
                          View pitch →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Talent Section */}
            <div className="backdrop-blur-sm bg-black/50 rounded-xl border-purple-500/30 p-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">
                    Featured Talent
                  </h2>
                  <p className="text-sm text-gray-400">Connect with top professionals</p>
                </div>
                <button
                  onClick={handleViewTalentClick}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  View all →
                </button>
              </div>

              {loading.users ? <TalentSkeleton /> : (
                <div className="space-y-3">
                  {featuredProfiles.map((user) => {
                    const profileImageUrl = getImageUrl(user.img);
                    return (
                      <div
                        key={user._id}
                        className="backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 p-3 hover:border-purple-500/60 transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(`/main/userdetails/${user._id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/30">
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
                                <span className="w-full h-full flex items-center justify-center text-sm font-bold text-purple-400">
                                  {user.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-black rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">
                              {user.name}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {user.status || "Professional"}
                            </p>
                            {'averageRating' in user && (
                              <div className="mt-0.5">
                                <StarRating rating={user.averageRating || 0} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Featured Articles Section */}
            <div className="backdrop-blur-sm bg-black/50 rounded-xl border-purple-500/30 p-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">
                    Featured Articles
                  </h2>
                  <p className="text-sm text-gray-400">Latest insights from our community</p>
                </div>
                <button
                  onClick={handleViewArticlesClick}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  View all →
                </button>
              </div>

              {loading.articles ? renderLoadingState('articles') : (
                <div className="space-y-3">
                  {featuredArticles.map((article) => {
                    const coverImageUrl = getImageUrl(article.coverImage);
                    const authorImageUrl = getImageUrl(article.author.img);

                    return (
                      <div
                        key={article._id}
                        className="backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 overflow-hidden hover:border-purple-500/60 transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(`/articles/${article._id}`)}
                      >
                        {coverImageUrl && (
                          <div className="h-24 overflow-hidden">
                            <img
                              src={coverImageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="p-3">
                          <h3 className="text-white text-sm font-medium mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
                            {article.title}
                          </h3>

                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {article.excerpt || article.content.substring(0, 100) + '...'}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {authorImageUrl ? (
                                <img
                                  src={authorImageUrl}
                                  alt={article.author.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <span className="text-[10px] text-purple-400">
                                    {article.author.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-gray-400">
                                {article.author.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{article.views} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;