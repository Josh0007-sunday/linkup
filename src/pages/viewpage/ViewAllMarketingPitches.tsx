import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MarketingPitch {
  _id: string;
  heroBannerImage: string;
  profileImage: string;
  nameOrCompany: string;
  briefBio: string;
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

const ViewAllMarketingPitches = () => {
  const [pitch, setPitch] = useState<MarketingPitch | null>(null); // Store a single pitch
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchPitch = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getMarketingPitch`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Backend response:", data); // Log the response
        setPitch(data.pitch); // Set the single pitch
        setError(null);
      } catch (error) {
        console.error("Error fetching marketing pitch:", error);
        setError("Failed to load marketing pitch. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPitch();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate("/homepage")}
          className="mb-6 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketing Pitch</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <Spinner />
        ) : pitch ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              key={pitch._id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/main/marketingdetails/${pitch._id}`)}
            >
              <div className="mb-6">
                <img
                  src={pitch.heroBannerImage}
                  alt="Hero Banner"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="flex items-center mb-6">
                <img
                  src={pitch.profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 ml-4">
                  {pitch.nameOrCompany}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {pitch.briefBio}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">No marketing pitch found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllMarketingPitches;