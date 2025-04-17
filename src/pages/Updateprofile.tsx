import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../components/AUTH/page";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaGlobe, FaWallet } from "react-icons/fa";

const UpdateProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    status: user?.status || "",
    bio: user?.bio || "",
    twitter_url: user?.twitter_url || "",
    facebook_url: user?.facebook_url || "",
    linkedin_url: user?.linkedin_url || "",
    github_url: user?.github_url || "",
    portfolio: user?.portfolio || "",
    eth_publickey: user?.eth_publickey || ""
  });

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
      setImageFile(e.target.files[0]);
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

      // Validate eth_publickey (optional, can be empty)
      if (formData.eth_publickey && !/^0x[a-fA-F0-9]{40}$/.test(formData.eth_publickey)) {
        toast.error("Invalid Ethereum address. It should start with 0x followed by 40 hexadecimal characters.");
        setLoading(false);
        return;
      }

      // Create FormData for file and text fields
      const formDataToSend = new FormData();
      formDataToSend.append("status", formData.status);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("twitter_url", formData.twitter_url);
      formDataToSend.append("facebook_url", formData.facebook_url);
      formDataToSend.append("linkedin_url", formData.linkedin_url);
      formDataToSend.append("github_url", formData.github_url);
      formDataToSend.append("portfolio", formData.portfolio);
      formDataToSend.append("eth_publickey", formData.eth_publickey);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Profile</h1>
          <p className="text-gray-600 mt-2">Keep your profile up to date</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label htmlFor="img" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                id="img"
                name="img"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-full border ${
                      formData.status === status
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                    } transition-colors duration-200`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            {/* Public Wallet Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Public Wallet</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="eth_publickey" className="block text-sm font-medium text-gray-700 mb-2">
                    Ethereum Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaWallet className="text-gray-400" />
                    </div>
                    <input
                      id="eth_publickey"
                      name="eth_publickey"
                      type="text"
                      value={formData.eth_publickey}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                      placeholder="e.g., 0x1234567890abcdef1234567890abcdef12345678"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Twitter URL */}
                  <div>
                    <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTwitter className="text-gray-400" />
                      </div>
                      <input
                        id="twitter_url"
                        name="twitter_url"
                        type="url"
                        value={formData.twitter_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                  </div>

                  {/* Facebook URL */}
                  <div>
                    <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFacebook className="text-gray-400" />
                      </div>
                      <input
                        id="facebook_url"
                        name="facebook_url"
                        type="url"
                        value={formData.facebook_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                        placeholder="https://facebook.com/yourusername"
                      />
                    </div>
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLinkedin className="text-gray-400" />
                        </div>
                        <input
                          id="linkedin_url"
                          name="linkedin_url"
                          type="url"
                          value={formData.linkedin_url}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                          placeholder="https://linkedin.com/in/yourusername"
                        />
                      </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* GitHub URL */}
                  <div>
                    <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGithub className="text-gray-400" />
                      </div>
                      <input
                        id="github_url"
                        name="github_url"
                        type="url"
                        value={formData.github_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGlobe className="text-gray-400" />
                      </div>
                      <input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-800 active:bg-gray-800'} 
                transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;