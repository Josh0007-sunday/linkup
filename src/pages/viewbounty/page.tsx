import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Award, Users, Timer, Send,} from "lucide-react";
import SubmissionsLeaderboard from "./submissionLeaderboard/page"; // Import the leaderboard component

interface Bounty {
  _id: string;
  title: string;
  tag: string;
  status: string;
  total_prizes: number;
  details: string;
  prizes: number[];
  duration: string;
  createdAt: string;
  submissions: any[]; // Add this to track the submission count
}

const BountyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("00h:00m:00s");
  const [submissionLink, setSubmissionLink] = useState("");
  const [tweetLink, setTweetLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch bounty details
  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const fetchBountyDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bounties/${id}`);
      setBounty(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching bounty details:", error.response?.data?.error || error.message);
        toast.error(error.response?.data?.error || "Failed to fetch bounty details. Please try again later.");
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining
  const calculateTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const difference = end.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Conditionally format based on days
      if (days > 0) {
        return `${days}d ${hours}h:${minutes}m:${seconds}s`;
      }
      return `${hours.toString().padStart(2, "0")}h:${minutes.toString().padStart(2, "0")}m:${seconds.toString().padStart(2, "0")}s`;
    }

    return "00h:00m:00s";
  };

  // Setup countdown timer
  useEffect(() => {
    fetchBountyDetails();
  }, [id]);

  useEffect(() => {
    if (bounty?.duration) {
      // Initial time remaining
      setTimeRemaining(calculateTimeRemaining(bounty.duration));

      // Setup interval to update countdown
      const timer = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(bounty.duration));
      }, 1000);

      // Cleanup interval on component unmount
      return () => clearInterval(timer);
    }
  }, [bounty]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("Please login to submit.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/bounties/${id}/submit`,
        { submission_link: submissionLink, tweet_link: tweetLink },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      if (response.data.message) {
        toast.success(response.data.message);
        setSubmissionLink("");
        setTweetLink("");
        setIsFormOpen(false);
        fetchBountyDetails(); // Refresh bounty details to show the new submission
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = 
          error.response?.data?.details || 
          error.response?.data?.error || 
          "Failed to submit. Please try again.";
        
        if (error.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error(errorMessage);
        }
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black">
        <div className="animate-pulse w-16 h-16 bg-purple-500/20 rounded-full border border-purple-500/20"></div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-purple-400">
        Bounty not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black p-4 pb-24">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
        {/* Prize Information */}
        <div className="bg-purple-500/10 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Award className="text-purple-400" size={24} />
            <span className="text-lg sm:text-xl font-bold text-purple-400">
              {bounty.total_prizes} USDC Total Prizes
            </span>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            {bounty.prizes.map((prize, index) => (
              <div key={index} className="text-center">
                <span className="text-sm text-purple-300">
                  {index + 1}st: {prize} USDC
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-purple-400 mb-2">{bounty.title}</h1>
              <span className="bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full text-sm">
                {bounty.tag}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Clock className="text-purple-400" size={20} />
              <span className="text-sm text-purple-300">
                Ends: {new Date(bounty.duration).toLocaleString()}
              </span>
            </div>
          </div>

          {/* About the Bounty */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2">About the Bounty</h2>
            <p className="text-gray-300 leading-relaxed">{bounty.details}</p>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
            <div className="bg-purple-500/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-2">
                <Users className="mr-2 text-purple-400" size={20} />
                <span className="font-semibold text-purple-300">Submissions</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{bounty.submissions?.length || 0}</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-2">
                <Timer className="mr-2 text-purple-400" size={20} />
                <span className="font-semibold text-purple-300">Remaining</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{timeRemaining}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              className="flex-1 bg-purple-500/10 text-purple-400 py-2 sm:py-3 rounded-lg hover:bg-purple-500/20 transition-colors font-semibold border border-purple-500/20 hover:border-purple-500/40"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <button
              className="flex-1 bg-purple-500 text-white py-2 sm:py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsFormOpen(!isFormOpen)}
              disabled={bounty.status === "ended"}
            >
              {bounty.status === "ended" ? "Bounty Ended" : "Submit Entry"}
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Leaderboard */}
      {id && <SubmissionsLeaderboard bountyId={id} />}

      {/* Submit Bounty Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 flex justify-center transition-transform duration-300 ease-in-out ${
          isFormOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-full max-w-2xl mx-4 sm:mx-6 bg-gray-900/30 backdrop-blur-xl shadow-lg rounded-t-2xl border border-purple-500/20">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-4">Submit Your Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="submissionLink" className="block text-sm font-medium text-purple-300 mb-1">
                  Submission Link
                </label>
                <input
                  id="submissionLink"
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="https://example.com/submission"
                  required
                />
              </div>
              <div>
                <label htmlFor="tweetLink" className="block text-sm font-medium text-purple-300 mb-1">
                  Tweet Link
                </label>
                <input
                  id="tweetLink"
                  type="url"
                  value={tweetLink}
                  onChange={(e) => setTweetLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-purple-500/20 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="https://twitter.com/your-tweet"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-purple-500/10 text-purple-400 py-2 sm:py-3 rounded-lg hover:bg-purple-500/20 transition-colors font-semibold border border-purple-500/20 hover:border-purple-500/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-500 text-white py-2 sm:py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="mr-2" size={20} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyDetails;