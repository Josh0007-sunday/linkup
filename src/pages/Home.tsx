import { useEffect, useState } from "react";
import { useAuth } from "../components/AUTH/page"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";
import ProfileUpdatePopup from "./addon/ProfileUpdatePopup";
import LinkUpCarousel from "./addon/LinkupCarousel";

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

const Home = () => {
  const { user: authUser } = useAuth(); // Renamed to avoid conflict with the users state
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]); // All users fetched from the backend
  const [featuredProfiles, setFeaturedProfiles] = useState<User[]>([]); // 3 random profiles to display
  const [jobs, setJobs] = useState<Job[]>([]); // All jobs fetched from the backend
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]); // 3 random jobs to display
  const [marketingPitch, setMarketingPitch] = useState<MarketingPitch | null>(null); // Marketing pitch
  const [showPopup, setShowPopup] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;
  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getUsers`);
        console.log("Response:", response); // Log the response

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
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
    navigate("/viewpage/users");
  };

  const handleViewJobsClick = () => {
    navigate("/viewpage/jobs");
  };

  const handleMarketingClick = () => {
    navigate("/viewpage/marketing-pitches");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
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
              <p className="text-3xl font-bold text-gray-700">2.4k+</p>
              <p className="text-sm text-gray-600 mt-1">Active Positions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">92%</p>
              <p className="text-sm text-gray-600 mt-1">Success Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">48h</p>
              <p className="text-sm text-gray-600 mt-1">Avg. Response Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">850+</p>
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
            className="text-gray-700 font-medium cursor-pointer hover:text-gray-800"
            onClick={handleViewTalentClick}
          >
            View all talent →
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProfiles.map((user) => (
            <div
              key={user._id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/profile/${user._id}`)}
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
                    .slice(0, 3) // Display only 3 social links
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
          ))}
        </div>
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
            className="text-gray-700 font-medium cursor-pointer hover:text-gray-800"
            onClick={handleViewJobsClick}
          >
            View all jobs →
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/jobs/${job._id}`)}
            >
              {/* Job Image */}
              <div className="mb-6">
                <img
                  src={job.imageUri}
                  alt={job.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>

              {/* Job Title and Project Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{job.projectname}</p>

              {/* Salary Range */}
              <div className="flex items-center text-gray-600 mb-4">
                <span className="text-sm">
                  ${job.price_minimum.toLocaleString()} - $
                  {job.price_maximum.toLocaleString()}
                </span>
              </div>

              {/* Work Method */}
              <div className="flex items-center text-gray-600 mb-4">
                <span className="text-sm">{job.method}</span>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2">
                {job.stack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
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
            className="text-gray-700 font-medium cursor-pointer hover:text-gray-800"
            onClick={handleMarketingClick}
          >
            View all talent →
          </div>
        </div>

        {marketingPitch && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              key={marketingPitch._id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
            >
              {/* Hero Banner Image */}
              <div className="mb-6">
                <img
                  src={marketingPitch.heroBannerImage}
                  alt="Hero Banner"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Profile Image and Name */}
              <div className="flex items-center mb-6">
                <img
                  src={marketingPitch.profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 ml-4">
                  {marketingPitch.nameOrCompany}
                </h3>
              </div>

              {/* Brief Bio */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {marketingPitch.briefBio}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;