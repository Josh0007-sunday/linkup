import { FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaWallet, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../components/AUTH/page';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import LoadingSkeleton from './LoadingSkeleton';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        const response = await axios.get('/user', {
          headers: { 'x-auth-token': token },
        });

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUser]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error(`Failed to copy ${label}`);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton type="profile" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-purple-500/20 p-6 md:p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={user?.img ? `${API_BASE_URL}${user.img}` : "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-purple-500/20"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {user?.name}
            </h2>
            <p className="text-gray-300">{user?.email}</p>
            <p className="text-purple-400">{user?.status || "No status set."}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/update-profile"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-6 py-2 rounded-lg border border-purple-500/20 backdrop-blur-sm transition-all duration-200"
              >
                Update Profile
              </Link>
              <Link
                to="/create-forum"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-6 py-2 rounded-lg border border-purple-500/20 backdrop-blur-sm transition-all duration-200"
              >
                Create Forum
              </Link>
              <Link
                to="/services"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-6 py-2 rounded-lg border border-purple-500/20 backdrop-blur-sm transition-all duration-200"
              >
                Create Ads
              </Link>
              <Link
                to="/meeting"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-6 py-2 rounded-lg border border-purple-500/20 backdrop-blur-sm transition-all duration-200"
              >
                Create Meetings
              </Link>
              <Link
                to="/write"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-6 py-2 rounded-lg border border-purple-500/20 backdrop-blur-sm transition-all duration-200"
              >
                Write
              </Link>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-400">Bio</h3>
            <p className="text-gray-300 mt-2">
              {user?.bio || "No bio available."}
            </p>
          </div>

          {/* Social Links Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-400">Social Links</h3>
            <div className="flex justify-center space-x-6 mt-4">
              {user?.twitter_url && (
                <a
                  href={user.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {user?.facebook_url && (
                <a
                  href={user.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  <FaFacebook size={24} />
                </a>
              )}
              {user?.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              )}
              {user?.github_url && (
                <a
                  href={user.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  <FaGithub size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-400">Portfolio</h3>
            {user?.portfolio ? (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                Visit Portfolio
              </a>
            ) : (
              <p className="text-gray-400">No portfolio available.</p>
            )}
          </div>

          {/* Public Wallet Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-400">Public Wallet</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ethereum Address */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Ethereum Address</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-300 text-sm truncate max-w-[160px]">
                    {user?.eth_publickey || "No address set"}
                  </p>
                  {user?.eth_publickey && (
                    <button
                      onClick={() => handleCopy(user.eth_publickey, "Ethereum address")}
                      className="text-gray-400 hover:text-purple-400 transform hover:scale-110 transition-all duration-200"
                      title="Copy Ethereum address"
                    >
                      <FaCopy />
                    </button>
                  )}
                </div>
              </div>

              {/* Solana Public Key */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Solana Public Key</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-300 text-sm truncate max-w-[160px]">
                    {user?.publicKey || "No public key set"}
                  </p>
                  {user?.publicKey && (
                    <button
                      onClick={() => handleCopy(user.publicKey, "Solana public key")}
                      className="text-gray-400 hover:text-purple-400 transform hover:scale-110 transition-all duration-200"
                      title="Copy Solana public key"
                    >
                      <FaCopy />
                    </button>
                  )}
                </div>
              </div>

              {/* Solana Private Key */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Solana Private Key</span>
                </div>
                <p className="text-red-400 text-xs mt-1">
                  Warning: Keep your private key secure. Never share publicly.
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-300 text-sm truncate max-w-[160px]">
                    {showPrivateKey ? user?.privatekey || "No private key set" : "••••••••"}
                  </p>
                  {user?.privatekey && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-gray-400 hover:text-purple-400 transform hover:scale-110 transition-all duration-200"
                        title={showPrivateKey ? "Hide private key" : "Show private key"}
                      >
                        {showPrivateKey ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleCopy(user.privatekey, "Solana private key")}
                        className="text-gray-400 hover:text-purple-400 transform hover:scale-110 transition-all duration-200"
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