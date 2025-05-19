import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/AUTH/page";

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
  reviews?: Array<{
    reviewerId: string;
    reviewerName: string;
    content: string;
    rating: number;
    createdAt: string;
  }>;
}

interface ReviewFormData {
  content: string;
  rating: number;
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

const StarRating = ({ rating, setRating }: { rating: number; setRating?: (rating: number) => void }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${setRating ? 'hover:text-yellow-500 cursor-pointer' : ''}`}
          disabled={!setRating}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    content: '',
    rating: 5
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const getImageUrl = (imgPath: string) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getUser/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data.users);
        setError(null);
        
        // Fetch average rating
        const ratingResponse = await fetch(`${API_BASE_URL}/users/${id}/average-rating`);
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setAverageRating(ratingData.averageRating);
          setReviewCount(ratingData.reviewCount);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, reviewSuccess]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewForm.content || !reviewForm.rating) {
      setReviewError('Please provide both content and rating');
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError(null);
      
      const response = await fetch(`${API_BASE_URL}/users/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('auth-token') || ''
        },
        body: JSON.stringify({
          content: reviewForm.content,
          rating: reviewForm.rating
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewSuccess('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ content: '', rating: 5 });
      
      // Refresh user data to show new review
      const userResponse = await fetch(`${API_BASE_URL}/getUser/${id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.users);
      }

      // Refresh average rating
      const ratingResponse = await fetch(`${API_BASE_URL}/users/${id}/average-rating`);
      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        setAverageRating(ratingData.averageRating);
        setReviewCount(ratingData.reviewCount);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError((error as Error).message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const hasReviewed = user?.reviews?.some(
    review => review.reviewerId === currentUser?._id
  );

  const profileImageUrl = getImageUrl(user?.img || '');

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 text-sm text-purple-400 bg-black/40 backdrop-blur-xl rounded-lg hover:bg-purple-500/20 border border-purple-500/20 flex items-center transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Spinner />
        ) : user ? (
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 overflow-hidden">
            {/* Header with gradient background */}
            <div className="h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 relative">
              {profileImageUrl && (
                <div className="absolute -bottom-12 left-6">
                  <div className="w-24 h-24 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-purple-500/20">
                    <img 
                      src={profileImageUrl} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile content */}
            <div className="pt-16 px-6 pb-6">
              {/* Name and basic info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{user.name}</h1>
                  <p className="text-sm text-gray-400 mt-1">{user.status || "Professional"}</p>
                  <div className="flex items-center mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">{user.email}</span>
                  </div>
                </div>
                
                {/* Rating display */}
                {averageRating !== null && (
                  <div className="mt-4 md:mt-0 bg-black/40 backdrop-blur-xl rounded-lg p-3 text-center border border-purple-500/20">
                    <div className="text-xl font-bold text-purple-400">{averageRating.toFixed(1)}</div>
                    <StarRating rating={Math.round(averageRating)} />
                    <div className="text-xs text-gray-400 mt-1">
                      {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bio section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About
                </h2>
                <div className="bg-black/40 backdrop-blur-xl rounded-lg p-4 border border-purple-500/20">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {user.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>
              </div>
              
              {/* Reviews section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Reviews
                  </h2>
                  {isAuthenticated && currentUser?._id !== id && !hasReviewed && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 border border-purple-500/20 transition-all duration-300 flex items-center text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {showReviewForm ? 'Cancel' : 'Add Review'}
                    </button>
                  )}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-4 bg-black/40 backdrop-blur-xl p-4 rounded-lg border border-purple-500/20">
                    <div className="mb-3">
                      <label className="block text-sm text-gray-400 mb-1 font-medium">Your Rating</label>
                      <StarRating 
                        rating={reviewForm.rating} 
                        setRating={(rating) => setReviewForm({...reviewForm, rating})} 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm text-gray-400 mb-1 font-medium">Your Review</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                        className="w-full px-3 py-2 bg-black/40 border border-purple-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-400 text-sm"
                        rows={3}
                        placeholder="Share your experience working with this person..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 transition-all duration-300 flex items-center justify-center text-sm border border-purple-500/20"
                    >
                      {reviewLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </form>
                )}

                {/* Reviews list */}
                {user.reviews && user.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {user.reviews.map((review, index) => (
                      <div key={index} className="bg-black/40 backdrop-blur-xl rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-white">{review.reviewerName}</h3>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">{review.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/40 backdrop-blur-xl rounded-lg p-6 text-center border border-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">No reviews yet</h3>
                    <p className="mt-1 text-xs text-gray-400">Be the first to share your experience!</p>
                  </div>
                )}
              </div>
              
              {/* Social links */}
              <div>
                <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Connect
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { url: user.portfolio, icon: '🔗', label: 'Portfolio', color: 'bg-purple-500/20 text-purple-400' },
                    { url: user.github_url, icon: 'GH', label: 'GitHub', color: 'bg-purple-500/20 text-purple-400' },
                    { url: user.linkedin_url, icon: 'in', label: 'LinkedIn', color: 'bg-purple-500/20 text-purple-400' },
                    { url: user.twitter_url, icon: 'X', label: 'Twitter', color: 'bg-purple-500/20 text-purple-400' },
                    { url: user.facebook_url, icon: 'f', label: 'Facebook', color: 'bg-purple-500/20 text-purple-400' },
                  ].map((link, index) => (
                    link.url && (
                      <a 
                        key={index}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center p-2 rounded-lg transition-all hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40"
                      >
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${link.color} text-sm font-medium`}>
                          {link.icon}
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-400">{link.label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">User not found</h3>
            <p className="mt-1 text-xs text-gray-400">The user you're looking for doesn't exist or may have been removed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;