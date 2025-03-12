import { useEffect, useState } from "react";
import axios, { } from "axios"; // Import AxiosError for type checking
import { Award, ChevronDown, ChevronUp, Trophy, ExternalLink } from "lucide-react";
import { useAuth } from "../../../components/AUTH/page"; // Replace with your authentication logic

interface Submission {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  submission_link: string;
  tweet_link: string;
  submittedAt: string;
  _id: string;
  upvotes: number;
  upvotedBy: string[]; // Track users who upvoted
}

interface SubmissionsLeaderboardProps {
  bountyId: string;
}

const SubmissionsLeaderboard = ({ bountyId }: SubmissionsLeaderboardProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { user, isAuthenticated } = useAuth(); // Get the logged-in user and authentication status
  const token = localStorage.getItem("auth-token"); // Get the token from localStorage

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
       
        const response = await axios.get(`${API_BASE_URL}/bounties/${bountyId}`);

        if (response.data && response.data.submissions) {
          // Sort submissions by date (newest first)
          const sortedSubmissions = [...response.data.submissions].sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          setSubmissions(sortedSubmissions);
        } else {
          setSubmissions([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to load submissions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (bountyId) {
      fetchSubmissions();
    }
  }, [bountyId]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleUpvote = async (submissionId: string) => {
    if (!isAuthenticated || !user?._id || !token) {
      alert("You must be logged in to upvote.");
      return;
    }

    try {
      console.log("Upvoting submission:", submissionId);
      const response = await axios.post(
        `${API_BASE_URL}/bounties/${bountyId}/submissions/${submissionId}/upvote`,
        {}, // Empty body
        {
          headers: {
            "x-auth-token": token, // Include the token in the headers
          },
        }
      );

      console.log("Upvote response:", response);

      if (response.status === 200) {
        // Update the local state to reflect the new upvote count
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission._id === submissionId
              ? { ...submission, upvotes: submission.upvotes + 1 }
              : submission
          )
        );
      }
    } catch (error) {
      console.error("Error upvoting submission:", error);

      // Type guard to check if the error is an AxiosError
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          alert("You must be logged in to upvote."); // Notify the user
        } else if (error.response && error.response.status === 400) {
          alert(error.response.data.error); // Notify the user if they've already upvoted
        } else {
          alert("Failed to upvote. Please try again later.");
        }
      } else {
        // Handle non-Axios errors
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  // Define how many submissions to show in collapsed view
  const displayLimit = 3;
  const displayedSubmissions = expanded ? submissions : submissions.slice(0, displayLimit);

  if (loading) {
    return (
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Trophy className="mr-2 text-blue-600" size={24} />
          Leaderboard
        </h2>
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Trophy className="mr-2 text-blue-600" size={24} />
          Leaderboard
        </h2>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-100">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Trophy className="mr-2 text-blue-600" size={24} />
          Leaderboard
          <span className="ml-2 text-gray-500 text-base font-normal">
            ({submissions.length} submissions)
          </span>
        </h2>
      </div>

      {submissions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-3">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No submissions yet</p>
          </div>
          <p className="text-gray-500">Be the first to compete and claim your spot!</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Links
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Upvotes
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedSubmissions.map((submission, index) => (
                  <tr
                    key={submission._id}
                    className={`
                      ${index < 3 ? 'bg-opacity-10' : ''}
                      ${index === 0 ? 'bg-yellow-50' : ''}
                      ${index === 1 ? 'bg-gray-50' : ''}
                      ${index === 2 ? 'bg-amber-50' : ''}
                      hover:bg-blue-50 transition-colors
                    `}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full">
                        {index === 0 ? (
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                            <Award size={18} className="text-yellow-500" />
                          </div>
                        ) : index === 1 ? (
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                            <Award size={18} className="text-gray-500" />
                          </div>
                        ) : index === 2 ? (
                          <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                            <Award size={18} className="text-amber-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                            <span className="text-gray-700 font-medium text-sm">{index + 1}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {submission.user?.name || "Anonymous"}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex space-x-4">
                        <a
                          href={submission.submission_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <span>Submission</span>
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                        <a
                          href={submission.tweet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <span>Tweet</span>
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      <span className="text-gray-400 ml-2">
                        {new Date(submission.submittedAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpvote(submission._id)}
                          disabled={user ? submission.upvotedBy.includes(user._id) : false}
                          className={`flex items-center ${user && submission.upvotedBy.includes(user._id)
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-500 hover:text-blue-600"
                            } transition-colors`}
                        >
                          <ChevronUp size={18} />
                        </button>
                        <span className="text-sm text-gray-700">{submission.upvotes}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submissions.length > displayLimit && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={toggleExpanded}
                className="flex items-center justify-center w-full py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={18} className="mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={18} className="mr-1" />
                    Show All Submissions ({submissions.length})
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubmissionsLeaderboard;