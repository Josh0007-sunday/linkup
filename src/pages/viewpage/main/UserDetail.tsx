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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200 flex items-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Spinner />
        ) : user ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header with gradient background */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
              {profileImageUrl && (
                <div className="absolute -bottom-16 left-6">
                  <div className="w-32 h-32 bg-white p-1 rounded-full shadow-xl">
                    <img 
                      src={profileImageUrl} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover border-4 border-white"
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
            <div className="pt-20 px-6 pb-6">
              {/* Name and basic info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{user.status || "Professional"}</p>
                  <div className="flex items-center mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-500">{user.email}</span>
                  </div>
                </div>
                
                {/* Rating display */}
                {averageRating !== null && (
                  <div className="mt-4 md:mt-0 bg-indigo-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-700">{averageRating.toFixed(1)}</div>
                    <StarRating rating={Math.round(averageRating)} />
                    <div className="text-sm text-gray-600 mt-1">
                      {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bio section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    {user.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>
              </div>
              
              {/* Reviews section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Reviews
                  </h2>
                  {isAuthenticated && currentUser?._id !== id && !hasReviewed && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {showReviewForm ? 'Cancel' : 'Add Review'}
                    </button>
                  )}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 font-medium">Your Rating</label>
                      <StarRating 
                        rating={reviewForm.rating} 
                        setRating={(rating) => setReviewForm({...reviewForm, rating})} 
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 font-medium">Your Review</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={4}
                        placeholder="Share your experience working with this person..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                      {reviewLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  <div className="space-y-4">
                    {user.reviews.map((review, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{review.reviewerName}</h3>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="mt-3 text-gray-600">{review.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-gray-500">Be the first to share your experience!</p>
                  </div>
                )}
              </div>
              
              {/* Social links */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Connect
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { url: user.portfolio, icon: '🔗', label: 'Portfolio', color: 'bg-blue-100 text-blue-600' },
                    { url: user.github_url, icon: 'GH', label: 'GitHub', color: 'bg-gray-800 text-white' },
                    { url: user.linkedin_url, icon: 'in', label: 'LinkedIn', color: 'bg-blue-600 text-white' },
                    { url: user.twitter_url, icon: 'X', label: 'Twitter', color: 'bg-blue-400 text-white' },
                    { url: user.facebook_url, icon: 'f', label: 'Facebook', color: 'bg-blue-800 text-white' },
                  ].map((link, index) => (
                    link.url && (
                      <a 
                        key={index}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center p-3 rounded-lg transition-all hover:shadow-md border border-gray-100 hover:border-gray-200"
                      >
                        <span className={`w-10 h-10 flex items-center justify-center rounded-full ${link.color} font-medium`}>
                          {link.icon}
                        </span>
                        <span className="ml-3 font-medium text-gray-700">{link.label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">User not found</h3>
            <p className="mt-1 text-gray-500">The user you're looking for doesn't exist or may have been removed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;