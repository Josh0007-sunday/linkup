import { FaTwitter, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import { useAuth } from '../components/AUTH/page';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

// Phantom Wallet Adapter Imports
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Phantom Wallet Styles
import '@solana/wallet-adapter-react-ui/styles.css';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth(); // Use setUser to update the user data
  const [loading, ] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  // Fetch updated user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        const response = await axios.get('/user', {
          headers: { 'x-auth-token': token },
        });

        setUser(response.data); // Update user data in the context
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [setUser]);

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
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card (Left) */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 col-span-1 md:col-span-2">
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
              href="/update-profile" // Link to the update profile page
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
        </div>

        {/* Balance Card (Right) */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 col-span-1">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Earnings</h2>
            <p className="text-gray-600">How much have been made</p>
            <p className="text-3xl font-bold text-gray-800">$0</p>
            {/* Phantom Wallet Connect Button */}
            <WalletMultiButton className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the Profile component with Solana wallet providers
const ProfileWithWallet: React.FC = () => {
  // Use the Solana devnet for testing
  const endpoint = clusterApiUrl('devnet');

  // Supported wallets (Phantom in this case)
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Profile />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default ProfileWithWallet;