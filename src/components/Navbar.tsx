import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaCog, FaUser, FaWallet, FaHistory, FaExternalLinkAlt, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from './AUTH/page';
import toast from 'react-hot-toast';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { IoDiamondOutline } from "react-icons/io5";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isWalletDrawerOpen, setIsWalletDrawerOpen] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // USDC token mint address on Solana (mainnet)
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const getImageUrl = (imgPath: string | undefined | null): string | undefined => {
    if (!imgPath) return undefined;
    if (typeof imgPath !== 'string') return undefined;
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  useEffect(() => {
    // Fetch USDC balance when wallet drawer is opened and user has a public key
    if (isWalletDrawerOpen && user?.publicKey) {
      fetchUsdcBalance();
    }
  }, [isWalletDrawerOpen, user?.publicKey]);

  const fetchUsdcBalance = async () => {
    if (!user?.publicKey) return;

    try {
      setIsWalletLoading(true);

      // Connect to Solana
      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=4c4a4f43-145d-4406-b89c-36ad977bb738', 'confirmed');
      const publicKey = new PublicKey(user.publicKey);

      // Find all token accounts owned by this address
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Find the USDC token account
      const usdcAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === USDC_MINT.toString()
      );

      if (usdcAccount) {
        // Get the balance
        const balance = usdcAccount.account.data.parsed.info.tokenAmount.uiAmount;
        setUsdcBalance(balance.toFixed(2));
      } else {
        setUsdcBalance('0.00');
      }
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      toast.error('Failed to fetch USDC balance');
      setUsdcBalance('0.00');
    } finally {
      setIsWalletLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleWalletDrawer = () => {
    setIsWalletDrawerOpen(!isWalletDrawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleWithdrawFunds = () => {
    navigate('/send-tokens');
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy.');
    });
  };

  return (
    <nav className="bg-black backdrop-blur-xl border-b border-purple-500/20 p-4 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/homepage" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-['Share_Tech']">LinkUp</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/bounties" className="text-gray-300 hover:text-purple-400 transition-colors">
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">Earn</span>
          </Link>
          <Link to="/serviceList" className="text-gray-300 hover:text-purple-400 transition-colors">Services</Link>
          <Link to="/view-forum" className="text-gray-300 hover:text-purple-400 transition-colors">View Forum</Link>
        </div>

        {/* Desktop Profile and Wallet Section */}
        <div className="hidden md:flex space-x-4 items-center relative">
          {user ? (
            <>
              <div className="flex items-center space-x-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                <IoDiamondOutline className="text-purple-400" />
                <span className="text-purple-300 font-medium">{user.xpNumber || 0} XP</span>
              </div>

              {/* Wallet Icon */}
              <button
                onClick={toggleWalletDrawer}
                className="p-2 text-gray-300 hover:text-purple-400 focus:outline-none transition-colors relative"
              >
                <FaWallet className="w-6 h-6" />
                {isWalletDrawerOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-black backdrop-blur-xl border border-purple-500/20 rounded-lg shadow-xl z-[101] overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-purple-500/20">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold">My Wallet</h2>
                        <button
                          onClick={toggleWalletDrawer}
                          className="text-gray-300 hover:text-purple-400 focus:outline-none transition-colors"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Balance card */}
                    <div className="p-4 border-b border-purple-500/20">
                      <p className="text-sm text-gray-400">Available Balance</p>
                      <div className="flex items-baseline mt-1">
                        {isWalletLoading ? (
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Loading...</p>
                        ) : (
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{usdcBalance}</p>
                        )}
                        <p className="ml-2 text-sm text-gray-400">USDC</p>
                        <button
                          onClick={fetchUsdcBalance}
                          className="ml-2 text-xs text-purple-400 hover:text-purple-300 underline transition-colors"
                          disabled={isWalletLoading}
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    {/* Wallet Details */}
                    <div className="p-4 space-y-4">
                      <div className="space-y-3">
                        <div className="bg-black/40 backdrop-blur-xl rounded-lg p-3 border border-purple-500/20">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-300">Public Key</p>
                            <button
                              onClick={() => copyToClipboard(user?.publicKey || '')}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <FaExternalLinkAlt className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-300 mr-2 font-mono">
                              {user?.publicKey ? truncateAddress(user.publicKey) : 'Not connected'}
                            </p>
                            <button
                              onClick={() => copyToClipboard(user?.publicKey || '')}
                              className="text-purple-400 hover:text-purple-300 text-xs underline transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div className="bg-black/40 backdrop-blur-xl rounded-lg p-3 border border-purple-500/20">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-300">Tiplink URL</p>
                            <button
                              onClick={() => copyToClipboard(user?.tiplinkUrl || '')}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <FaExternalLinkAlt className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-300 mr-2 font-mono">
                              {user?.tiplinkUrl ? truncateAddress(user.tiplinkUrl) : 'Not available'}
                            </p>
                            <button
                              onClick={() => copyToClipboard(user?.tiplinkUrl || '')}
                              className="text-purple-400 hover:text-purple-300 text-xs underline transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Info card */}
                      <div className="bg-black/40 backdrop-blur-xl rounded-lg p-3 border-l-4 border-purple-500/20">
                        <p className="text-sm text-gray-300">Payments will be automatically deposited to this wallet when you win bounties.</p>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2 pt-2">
                        <button
                          disabled
                          className="w-full bg-black/40 backdrop-blur-xl text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center border border-purple-500/20 text-sm"
                        >
                          <FaHistory className="mr-2" />
                          View Transaction History
                        </button>

                        <button
                          onClick={handleWithdrawFunds}
                          disabled
                          className="w-full bg-black/40 backdrop-blur-xl text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center border border-purple-500/20 text-sm"
                        >
                          <FaMoneyBillWave className="mr-2" />
                          Withdraw Funds
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <FaUserCircle className="text-purple-400 group-hover:text-purple-300 w-8 h-8 transition-colors" />
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-purple-500/30 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                        {user.profileImage ? (
                          <img
                            src={getImageUrl(user.profileImage) || undefined}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-bold text-purple-400">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-purple-500/20 space-x-3 transition-colors"
                      >
                        <FaUser className="text-purple-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/update-profile"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-purple-500/20 space-x-3 transition-colors"
                      >
                        <FaCog className="text-purple-400" />
                        <span>Account Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-red-400 hover:bg-red-500/20 space-x-3 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-gray-300 hover:text-purple-400 transition-colors">Sign Up</Link>
              <Link to="/" className="text-gray-300 hover:text-purple-400 transition-colors">Login</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-300 hover:text-purple-400 focus:outline-none transition-colors">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/40 backdrop-blur-xl border-b border-purple-500/20 shadow-lg z-50">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to="/bounties"
              className="text-gray-300 hover:text-purple-400 transition-colors"
              onClick={toggleMenu}
            >
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">Earn</span>
            </Link>
            <Link
              to="/serviceList"
              className="text-gray-300 hover:text-purple-400 transition-colors"
              onClick={toggleMenu}
            >
              Services
            </Link>
            <Link 
              to="/view-forum" 
              className="text-gray-300 hover:text-purple-400 transition-colors"
              onClick={toggleMenu}
            >
              View Forum
            </Link>

            {/* Mobile Profile and Wallet Section */}
            {user ? (
              <>
                <button
                  onClick={toggleWalletDrawer}
                  className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <FaWallet className="text-purple-400" />
                  <span>Wallet</span>
                </button>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                    onClick={toggleMenu}
                  >
                    <FaUser className="text-purple-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/update-profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                    onClick={toggleMenu}
                  >
                    <FaCog className="text-purple-400" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaSignOutAlt className="text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;