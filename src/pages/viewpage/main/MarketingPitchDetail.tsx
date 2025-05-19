import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface MarketingPitch {
  _id: string;
  heroBannerImage: string;
  profileImage: string;
  nameOrCompany: string;
  briefBio: string;
  solutionLongText: string;
  youtubeCode: string;
  proofOfImpact: string;
  partnershipTags: string[];
  ctaUrl: string;
  twitterUrl: string;
}

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-purple-500/20"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-purple-500 border-t-transparent"></div>
      </div>
    </div>
  );
};

const MarketingPitchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [pitch, setPitch] = useState<MarketingPitch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

   const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchPitch = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getMarketingPitch/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setPitch(data.pitch);
        setError(null);
      } catch (error) {
        console.error("Error fetching marketing pitch:", error);
        setError("Failed to load marketing pitch details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPitch();
  }, [id]);

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
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
        ) : pitch ? (
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20 overflow-hidden">
            {/* Hero Banner */}
            <div className="relative h-64 w-full">
              <img
                src={pitch.heroBannerImage}
                alt="Hero Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
            </div>
            
            {/* Profile section */}
            <div className="px-8 py-6 -mt-16 relative z-10">
              {/* Profile and name */}
              <div className="flex flex-col md:flex-row items-center md:items-end">
                <div className="relative">
                  <div className="w-32 h-32 bg-black/40 backdrop-blur-xl p-2 rounded-full border border-purple-500/20">
                    <img
                      src={pitch.profileImage}
                      alt={pitch.nameOrCompany}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.nameOrCompany)}&background=0D8ABC&color=fff`;
                      }}
                    />
                  </div>
                </div>
                
                {/* Name */}
                <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{pitch.nameOrCompany}</h1>
                </div>
              </div>
              
              {/* Bio */}
              <div className="mt-8 pb-6 border-b border-purple-500/20">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3">About</h2>
                <p className="text-gray-400 leading-relaxed">
                  {pitch.briefBio}
                </p>
              </div>
              
              {/* Solution */}
              <div className="py-6 border-b border-purple-500/20">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3">Solution</h2>
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                  {pitch.solutionLongText}
                </p>
              </div>
              
              {/* YouTube Video */}
              {pitch.youtubeCode && (
                <div className="py-6 border-b border-purple-500/20">
                  <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Watch Our Video</h2>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${pitch.youtubeCode}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-64 md:h-96 rounded-lg border border-purple-500/20"
                    ></iframe>
                  </div>
                </div>
              )}
              
              {/* Proof of Impact */}
              <div className="py-6 border-b border-purple-500/20">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3">Proof of Impact</h2>
                <div className="bg-purple-500/20 border-l-4 border-purple-500 p-4 rounded">
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                    {pitch.proofOfImpact}
                  </p>
                </div>
              </div>
              
              {/* Partnership Tags */}
              <div className="py-6 border-b border-purple-500/20">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Partnership Opportunities</h2>
                <div className="flex flex-wrap gap-2">
                  {pitch.partnershipTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/20 hover:bg-purple-500/30 transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Connect section */}
              <div className="py-6">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Connect</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pitch.ctaUrl && (
                    <a 
                      href={pitch.ctaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center p-4 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all duration-300 hover:bg-purple-500/30"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full text-purple-400 border border-purple-500/20">
                        🔗
                      </span>
                      <span className="ml-3 font-medium">Visit Website</span>
                    </a>
                  )}
                  {pitch.twitterUrl && (
                    <a 
                      href={pitch.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center p-4 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all duration-300 hover:bg-purple-500/30"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full text-purple-400 border border-purple-500/20 text-sm">
                        X
                      </span>
                      <span className="ml-3 font-medium">Follow on Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">Marketing pitch not found</h3>
            <p className="mt-1 text-xs text-gray-400">The pitch you're looking for doesn't exist or may have been removed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingPitchDetail;