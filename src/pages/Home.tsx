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

const Home = () => {
  const { user: authUser } = useAuth(); // Renamed to avoid conflict with the users state
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]); // All users fetched from the backend
  const [featuredProfiles, setFeaturedProfiles] = useState<User[]>([]); // 3 random profiles to display
  const [jobs, setJobs] = useState<Job[]>([]); // All jobs fetched from the backend
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]); // 3 random jobs to display
  const [marketingPitch, setMarketingPitch] = useState<MarketingPitch | null>(null); // Marketing pitch
  const [showPopup, setShowPopup] = useState(true);
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

  const handleExploreClick = () => {
    navigate("/viewpage/marketing-pitches");
  };

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
                <LoadingSkeleton type="article" />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">

      {authUser && showPopup && <ProfileUpdatePopup onClose={handleClosePopup} />}

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome,{" "}
          <span className="text-gray-700">{authUser?.name.split(" ")[0]}</span>
        </h1>
        <p className="text-lg text-gray-600">
          Your gateway to exceptional opportunities and talent
        </p>
      </div>

      {/* Two Card Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Main Card */}
        <div
          onClick={handleExploreClick}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 flex flex-col justify-between border border-gray-100 cursor-pointer"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Find Your Next Opportunity
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Browse through carefully curated positions matched to your expertise and aspirations.
              Our intelligent system ensures you discover roles that align with your career goals.
            </p>
          </div>
          <div className="mt-8 inline-flex items-center text-gray-700 font-medium">
            Explore opportunities →
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Job Market Insights
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-bold text-gray-700">0</p>
              <p className="text-sm text-gray-600 mt-1">Active Positions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">0%</p>
              <p className="text-sm text-gray-600 mt-1">Success Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">48h</p>
              <p className="text-sm text-gray-600 mt-1">Avg. Response Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">4+</p>
              <p className="text-sm text-gray-600 mt-1">Partner Companies</p>
            </div>
          </div>
        </div>
      </div>

      <LinkUpCarousel />

      {/* Featured Talent Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Featured Talent
            </h2>
            <p className="text-gray-600">
              Connect with top professionals ready to bring value to your team
            </p>
          </div>
          <div
            className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition-colors"
            onClick={handleViewTalentClick}
          >
            View all talent →
          </div>
        </div>
        {loading.users ? renderLoadingState('users') : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProfiles.map((user) => {
              const profileImageUrl = getImageUrl(user.img);
              return (
                <div
                  key={user._id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group"
                  onClick={() => navigate(`/main/userdetails/${user._id}`)}
                >
                  <div className="flex items-center mb-6">
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
                      {/* Updated rating display with actual data */}
                      {'averageRating' in user && (
                        <div className="mt-1">
                          <StarRating rating={user.averageRating || 0} />
                          <span className="text-xs text-gray-500 ml-1">
                            {user.reviewCount || 0} {user.reviewCount === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
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
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {user.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Recommendations Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Job Recommendations
            </h2>
            <p className="text-gray-600">
              Explore the latest job opportunities tailored for you
            </p>
          </div>
          <div
            className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition-colors"
            onClick={handleViewJobsClick}
          >
            View all jobs →
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div
              key={job._id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/jobs/${job._id}`)}
            >
              {/* Job Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={job.imageUri}
                  alt={job.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800">
                      {job.method}
                    </span>
                    <span className="px-3 py-1 bg-indigo-500/90 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                      ${job.price_minimum.toLocaleString()} - ${job.price_maximum.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {job.projectname}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {job.stack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* View Details Button */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Posted recently
                  </span>
                  <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Pitch Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Featured Marketing Pitches
            </h2>
            <p className="text-gray-600">
              Discover the latest marketing pitches from top professionals
            </p>
          </div>

          <div
            className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition-colors"
            onClick={handleMarketingClick}
          >
            View all pitches →
          </div>
        </div>

        {marketingPitch && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              key={marketingPitch._id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/viewpage/marketing-pitches/${marketingPitch._id}`)}
            >
              {/* Hero Banner Image with Overlay */}
              <div className="relative h-56 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                <img
                  src={marketingPitch.heroBannerImage}
                  alt="Hero Banner"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Profile Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={marketingPitch.profileImage}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                        {marketingPitch.nameOrCompany}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow-lg">
                        Marketing Professional
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Brief Bio */}
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {marketingPitch.briefBio}
                </p>

                {/* View Details Button */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium">
                      Marketing
                    </span>
                  </div>
                  <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View pitch →
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Featured Articles Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Featured Articles
            </h2>
            <p className="text-gray-600">
              Discover insightful articles from our community
            </p>
          </div>
          <div
            className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition-colors"
            onClick={handleViewArticlesClick}
          >
            View all articles →
          </div>
        </div>
        {loading.articles ? renderLoadingState('articles') : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => {
              const coverImageUrl = getImageUrl(article.coverImage);
              const authorImageUrl = getImageUrl(article.author.img);

              return (
                <div
                  key={article._id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group"
                  onClick={() => navigate(`/articles/${article._id}`)}
                >
                  {/* Article Cover Image */}
                  {coverImageUrl && (
                    <div className="mb-6 h-48 overflow-hidden rounded-lg">
                      <img
                        src={coverImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Article Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Article Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.excerpt || article.content.substring(0, 100) + '...'}
                  </p>

                  {/* Author and Metadata */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      {authorImageUrl ? (
                        <img
                          src={authorImageUrl}
                          alt={article.author.name}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <span className="text-sm font-medium">
                            {article.author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600">
                        {article.author.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {article.views} views
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;