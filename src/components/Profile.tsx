import { FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaWallet, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../components/AUTH/page';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false); // Toggle for private key visibility

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  // Fetch updated user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        const response = await axios.get('/user', {
          headers: { 'x-auth-token': token },
        });

        setUser(response.data); // Update user data in context
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUser]);

  // Handle copying text to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error(`Failed to copy ${label}`);
    });
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <div className="flex flex-col items-center space-y-4">
            <img
              src={user?.img ? `${API_BASE_URL}${user.img}` : "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-gray-200"
            />
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600">{user?.status || "No status set."}</p>
            <a
              href="/update-profile"
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-200"
            >
              Update Profile
            </a>
          </div>

          {/* Bio Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Bio</h3>
            <p className="text-gray-600 mt-2">
              {user?.bio || "No bio available."}
            </p>
          </div>

          {/* Social Links Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Social Links</h3>
            <div className="flex justify-center space-x-6 mt-4">
              {user?.twitter_url && (
                <a
                  href={user.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {user?.facebook_url && (
                <a
                  href={user.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <FaFacebook size={24} />
                </a>
              )}
              {user?.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-700"
                >
                  <FaLinkedin size={24} />
                </a>
              )}
              {user?.github_url && (
                <a
                  href={user.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaGithub size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Portfolio</h3>
            {user?.portfolio ? (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Visit Portfolio
              </a>
            ) : (
              <p className="text-gray-600">No portfolio available.</p>
            )}
          </div>

          {/* Resume Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Resume</h3>
            {user?.portfolio ? (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Download Resume
              </a>
            ) : (
              <p className="text-gray-600">No resume available.</p>
            )}
          </div>

          {/* Public Wallet Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Public Wallet</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ethereum Address */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Ethereum Address</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-600 text-sm truncate max-w-[160px]">
                    {user?.eth_publickey || "No address set"}
                  </p>
                  {user?.eth_publickey && (
                    <button
                      onClick={() => handleCopy(user.eth_publickey, "Ethereum address")}
                      className="text-gray-500 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                      title="Copy Ethereum address"
                    >
                      <FaCopy />
                    </button>
                  )}
                </div>
              </div>

              {/* Solana Public Key */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Solana Public Key</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-600 text-sm truncate max-w-[160px]">
                    {user?.publicKey || "No public key set"}
                  </p>
                  {user?.publicKey && (
                    <button
                      onClick={() => handleCopy(user.publicKey, "Solana public key")}
                      className="text-gray-500 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                      title="Copy Solana public key"
                    >
                      <FaCopy />
                    </button>
                  )}
                </div>
              </div>

              {/* Solana Private Key */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Solana Private Key</span>
                </div>
                <p className="text-red-600 text-xs mt-1">
                  Warning: Keep your private key secure. Never share publicly.
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-600 text-sm truncate max-w-[160px]">
                    {showPrivateKey ? user?.privatekey || "No private key set" : "••••••••"}
                  </p>
                  {user?.privatekey && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-gray-500 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                        title={showPrivateKey ? "Hide private key" : "Show private key"}
                      >
                        {showPrivateKey ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleCopy(user.privatekey, "Solana private key")}
                        className="text-gray-500 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                        title="Copy Solana private key"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;