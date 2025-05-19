import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../components/AUTH/page";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaGlobe, FaWallet, FaUpload } from "react-icons/fa";

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

      if (formData.eth_publickey && !/^0x[a-fA-F0-9]{40}$/.test(formData.eth_publickey)) {
        toast.error("Invalid Ethereum address. It should start with 0x followed by 40 hexadecimal characters.");
        setLoading(false);
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
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black p-4 md:p-8">
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
            Update Profile
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Keep your profile up to date</p>
        </div>
        <div className="bg-gray-900/30 backdrop-blur-xl shadow-2xl rounded-2xl border border-purple-500/20 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer pointer-events-none" />
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            {/* Image Upload */}
            <div className="group">
              <label htmlFor="img" className="block text-sm font-medium text-purple-400 mb-2 group-hover:text-purple-300 transition-colors duration-200">
                Profile Image
              </label>
              <div className="relative">
                <input
                  id="img"
                  name="img"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
                <FaUpload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 group-hover:text-purple-300 transition-colors duration-200" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-purple-400 mb-3">
                Status
              </label>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
                      formData.status === status
                        ? "border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        : "border-purple-500/20 text-gray-300 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="group">
              <label htmlFor="bio" className="block text-sm font-medium text-purple-400 mb-2 group-hover:text-purple-300 transition-colors duration-200">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            {/* Public Wallet Section */}
            <div className="group">
              <h2 className="text-lg font-semibold text-purple-400 mb-4 group-hover:text-purple-300 transition-colors duration-200">Public Wallet</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="eth_publickey" className="block text-sm font-medium text-purple-400 mb-2 group-hover:text-purple-300 transition-colors duration-200">
                    Ethereum Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaWallet className="text-purple-400 group-hover:text-purple-300 transition-colors duration-200" />
                    </div>
                    <input
                      id="eth_publickey"
                      name="eth_publickey"
                      type="text"
                      value={formData.eth_publickey}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      placeholder="e.g., 0x1234567890abcdef1234567890abcdef12345678"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="group">
              <h2 className="text-lg font-semibold text-purple-400 mb-4 group-hover:text-purple-300 transition-colors duration-200">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Twitter URL */}
                  <div className="group/item">
                    <label htmlFor="twitter_url" className="block text-sm font-medium text-purple-400 mb-2 group-hover/item:text-purple-300 transition-colors duration-200">
                      Twitter URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTwitter className="text-purple-400 group-hover/item:text-purple-300 transition-colors duration-200" />
                      </div>
                      <input
                        id="twitter_url"
                        name="twitter_url"
                        type="url"
                        value={formData.twitter_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                  </div>

                  {/* Facebook URL */}
                  <div className="group/item">
                    <label htmlFor="facebook_url" className="block text-sm font-medium text-purple-400 mb-2 group-hover/item:text-purple-300 transition-colors duration-200">
                      Facebook URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFacebook className="text-purple-400 group-hover/item:text-purple-300 transition-colors duration-200" />
                      </div>
                      <input
                        id="facebook_url"
                        name="facebook_url"
                        type="url"
                        value={formData.facebook_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        placeholder="https://facebook.com/yourusername"
                      />
                    </div>
                  </div>

                  {/* LinkedIn URL */}
                  <div className="group/item">
                    <label htmlFor="linkedin_url" className="block text-sm font-medium text-purple-400 mb-2 group-hover/item:text-purple-300 transition-colors duration-200">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLinkedin className="text-purple-400 group-hover/item:text-purple-300 transition-colors duration-200" />
                      </div>
                      <input
                        id="linkedin_url"
                        name="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* GitHub URL */}
                  <div className="group/item">
                    <label htmlFor="github_url" className="block text-sm font-medium text-purple-400 mb-2 group-hover/item:text-purple-300 transition-colors duration-200">
                      GitHub URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGithub className="text-purple-400 group-hover/item:text-purple-300 transition-colors duration-200" />
                      </div>
                      <input
                        id="github_url"
                        name="github_url"
                        type="url"
                        value={formData.github_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>

                  {/* Portfolio URL */}
                  <div className="group/item">
                    <label htmlFor="portfolio" className="block text-sm font-medium text-purple-400 mb-2 group-hover/item:text-purple-300 transition-colors duration-200">
                      Portfolio URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGlobe className="text-purple-400 group-hover/item:text-purple-300 transition-colors duration-200" />
                      </div>
                      <input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-800/30 border border-purple-500/20 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
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
              className={`w-full py-4 px-6 rounded-xl font-medium backdrop-blur-sm transition-all duration-200 relative overflow-hidden group
                ${loading
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'} 
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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