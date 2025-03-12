import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useAuth } from "../../components/AUTH/page";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaGlobe, FaArrowRight, FaArrowLeft, FaCheck, FaUser } from "react-icons/fa";

const UserOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [animateIn, setAnimateIn] = useState(false);
  const [formData, setFormData] = useState({
    status: user?.status || "",
    bio: user?.bio || "",
    twitter_url: user?.twitter_url || "",
    facebook_url: user?.facebook_url || "",
    linkedin_url: user?.linkedin_url || "",
    github_url: user?.github_url || "",
    portfolio: user?.portfolio || "",
  });

  useEffect(() => {
    // Trigger animation when component mounts
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    // Reset animation state on step change
    setAnimateIn(false);
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const statusOptions = [
    "UI/UX Designer",
    "Frontend Developer",
    "Backend Developer",
    "Content Creator",
    "Full Stack Developer",
    "DevOps Engineer",
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    setFormData({ ...formData, status });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_CONNECTION;
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("Please login first");
        window.location.href = '/login';
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("status", formData.status);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("twitter_url", formData.twitter_url);
      formDataToSend.append("facebook_url", formData.facebook_url);
      formDataToSend.append("linkedin_url", formData.linkedin_url);
      formDataToSend.append("github_url", formData.github_url);
      formDataToSend.append("portfolio", formData.portfolio);
      if (imageFile) {
        formDataToSend.append("img", imageFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/update-profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
          withCredentials: false,
        }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
        return;
      }
      console.error("Update profile error:", error);
      const errorMessage = error.response?.data?.error || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Line connecting the steps */}
          <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
          
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium transition-all duration-500
                  ${currentStep > step 
                    ? 'bg-green-500 shadow-lg shadow-green-200' 
                    : currentStep === step 
                      ? 'bg-gray-700 scale-110 shadow-lg shadow-gray-200' 
                      : 'bg-gray-300'}`}
              >
                {currentStep > step ? <FaCheck className="text-white text-lg" /> : step}
              </div>
              <div className={`text-sm mt-3 font-medium transition-all duration-300 ${currentStep === step ? 'text-black' : 'text-gray-600'}`}>
                {step === 1 && "Basic Info"}
                {step === 2 && "About You"}
                {step === 3 && "Social Links"}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 transform transition-all duration-500 ease-out">
          <p className="text-gray-600 mt-3">Let's showcase your professional identity</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 overflow-hidden">
          {renderProgressBar()}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`transform transition-all duration-500 ${animateIn ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center">
                    <div className="relative group mb-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-100 flex items-center justify-center transition-all duration-300">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <FaUser className="text-gray-300 text-4xl" />
                        )}
                      </div>
                      <label htmlFor="img" className="absolute bottom-0 right-0 bg-gray-700 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-800 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <input
                          id="img"
                          name="img"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-gray-500 text-sm">Upload a professional profile photo</p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-lg font-medium text-gray-800 mb-3">
                      What best describes your expertise?
                    </label>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(status)}
                          className={`px-5 py-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            formData.status === status
                              ? "border-black bg-gray-50 text-black shadow-md"
                              : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: About You */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-lg font-medium text-gray-800 mb-3">
                      Tell us about yourself
                    </label>
                    <div className="relative">
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300"
                        placeholder="Share your professional background, skills, experience, and goals..."
                        rows={8}
                      />
                      <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
                        {formData.bio.length} characters
                      </div>
                    </div>
                    <p className="mt-2 text-gray-500 text-sm">
                      A well-crafted bio helps others understand your expertise and interests.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Social Links */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <p className="text-gray-600 mb-6">
                    Connect your professional profiles to showcase your work and expand your network.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Twitter URL */}
                      <div className="group">
                        <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-black transition-colors duration-300">
                          Twitter URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaTwitter className="text-gray-400 group-hover:text-black transition-colors duration-300" />
                          </div>
                          <input
                            id="twitter_url"
                            name="twitter_url"
                            type="url"
                            value={formData.twitter_url}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300"
                            placeholder="https://twitter.com/yourusername"
                          />
                        </div>
                      </div>

                      {/* Facebook URL */}
                      <div className="group">
                        <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-black transition-colors duration-300">
                          Facebook URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaFacebook className="text-gray-400 group-hover:text-black transition-colors duration-300" />
                          </div>
                          <input
                            id="facebook_url"
                            name="facebook_url"
                            type="url"
                            value={formData.facebook_url}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300"
                            placeholder="https://facebook.com/yourusername"
                          />
                        </div>
                      </div>

                      {/* LinkedIn URL */}
                      <div className="group">
                        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-black transition-colors duration-300">
                          LinkedIn URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaLinkedin className="text-gray-400 group-hover:text-black transition-colors duration-300" />
                          </div>
                          <input
                            id="linkedin_url"
                            name="linkedin_url"
                            type="url"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300"
                            placeholder="https://linkedin.com/in/yourusername"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* GitHub URL */}
                      <div className="group">
                        <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-black transition-colors duration-300">
                          GitHub URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaGithub className="text-gray-400 group-hover:text-black transition-colors duration-300" />
                          </div>
                          <input
                            id="github_url"
                            name="github_url"
                            type="url"
                            value={formData.github_url}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300"
                            placeholder="https://github.com/yourusername"
                          />
                        </div>
                      </div>

                      {/* Portfolio URL */}
                      <div className="group">
                        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-black transition-colors duration-300">
                          Portfolio URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaGlobe className="text-gray-400 group-hover:text-black transition-colors duration-300" />
                          </div>
                          <input
                            id="portfolio"
                            name="portfolio"
                            type="url"
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all duration-300"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                >
                  <FaArrowLeft className="text-sm" />
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 flex items-center gap-2 bg-gray-700 rounded-xl text-white font-medium hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Continue
                  <FaArrowRight className="text-sm" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg transition-all duration-300 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800 transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Complete Profile
                      <FaCheck className="text-sm" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;