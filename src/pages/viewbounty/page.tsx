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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-900">Bounty not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 pb-24">
      <Toaster position="top-center" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Prize Information */}
        <div className="bg-gray-100 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Award className="text-gray-700" size={24} />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {bounty.total_prizes} USDC Total Prizes
            </span>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            {bounty.prizes.map((prize, index) => (
              <div key={index} className="text-center">
                <span className="text-sm text-gray-600">
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{bounty.title}</h1>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                {bounty.tag}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Clock className="text-gray-500" size={20} />
              <span className="text-sm text-gray-600">
                Ends: {new Date(bounty.duration).toLocaleString()}
              </span>
            </div>
          </div>

          {/* About the Bounty */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">About the Bounty</h2>
            <p className="text-gray-700 leading-relaxed">{bounty.details}</p>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
            <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-2">
                <Users className="mr-2 text-gray-700" size={20} />
                <span className="font-semibold text-gray-700">Submissions</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{bounty.submissions?.length || 0}</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-2">
                <Timer className="mr-2 text-gray-700" size={20} />
                <span className="font-semibold text-gray-700">Remaining</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{timeRemaining}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              className="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <button
              className="flex-1 bg-gray-700 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
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
        <div className="w-full max-w-2xl mx-4 sm:mx-6 bg-white shadow-lg rounded-t-2xl border border-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Submit Your Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="submissionLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Link
                </label>
                <input
                  id="submissionLink"
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-500"
                  placeholder="https://example.com/submission"
                  required
                />
              </div>
              <div>
                <label htmlFor="tweetLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Tweet Link
                </label>
                <input
                  id="tweetLink"
                  type="url"
                  value={tweetLink}
                  onChange={(e) => setTweetLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-500"
                  placeholder="https://twitter.com/your-tweet"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-700 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center"
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