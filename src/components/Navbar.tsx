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
    <nav className="bg-white shadow-subtle border-b border-gray-100 p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/homepage" className="text-xl font-bold text-gray-800">LinkUp</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/bounties" className="text-gray-600 hover:text-gray-900 transition-colors">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Earn</span>
          </Link>
          <Link to="/serviceList" className="text-gray-600 hover:text-gray-900 transition-colors">Services</Link>
          <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">Profile</Link>
          <Link to="/view-forum" className="text-gray-600 hover:text-gray-900 transition-colors">View Forum</Link>
          <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors">Create Ads</Link>
          <Link to="/create-forum" className="text-gray-600 hover:text-gray-900 transition-colors">Create Forum</Link>
        </div>

        {/* Desktop Profile and Wallet Section */}
        <div className="hidden md:flex space-x-4 items-center relative">
          {user ? (
            <>

              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                <IoDiamondOutline className="text-blue-500" /> {/* Diamond icon */}
                <span className="text-gray-700 font-medium">{user.xpNumber || 0} XP</span> {/* XP number */}
              </div>
              
              {/* Wallet Icon */}
              <button
                onClick={toggleWalletDrawer}
                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <FaWallet className="w-6 h-6" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUserCircle className="text-gray-500 group-hover:text-gray-700 w-8 h-8" />
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUserCircle className="text-gray-500 w-10 h-10" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 space-x-3"
                      >
                        <FaUser className="text-gray-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/update-profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 space-x-3"
                      >
                        <FaCog className="text-gray-400" />
                        <span>Account Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 space-x-3"
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
              <Link to="/signup" className="text-gray-700 hover:text-black">Sign Up</Link>
              <Link to="/" className="text-gray-700 hover:text-black">Login</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-800 focus:outline-none">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to="/bounties"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={toggleMenu}
            >
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Earn</span>
            </Link>
            <Link
              to="/serviceList"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={toggleMenu}
            >
              Services
            </Link>
            <Link
              to="/profile"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={toggleMenu}
            >
              Profile
            </Link>
            <Link
              to="/services"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={toggleMenu}
            >
              Create Ads
            </Link>

            {/* Mobile Profile and Wallet Section */}
            {user ? (
              <>
                <button
                  onClick={toggleWalletDrawer}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <FaWallet className="text-gray-400" />
                  <span>Wallet</span>
                </button>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    onClick={toggleMenu}
                  >
                    <FaUser className="text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/update-profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    onClick={toggleMenu}
                  >
                    <FaCog className="text-gray-400" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-800"
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
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Wallet Drawer */}
      {isWalletDrawerOpen && (
        <div className="fixed inset-0 bg-opacity-40 z-50 transition-all" onClick={toggleWalletDrawer}>
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl p-0 transition-all transform"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="text-gray-700 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl text-gray-600 font-bold">My Wallet</h2>
                <button
                  onClick={toggleWalletDrawer}
                  className="text-gray-700 hover:text-gray-700 focus:outline-none transition-transform transform hover:rotate-90"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* Balance card */}
              <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-sm text-gray-500">Available Balance</p>
                <div className="flex items-baseline mt-1">
                  {isWalletLoading ? (
                    <p className="text-3xl font-bold">Loading...</p>
                  ) : (
                    <p className="text-3xl font-bold">{usdcBalance}</p>
                  )}
                  <p className="ml-2 text-sm text-gray-500">USDC</p>
                  <button
                    onClick={fetchUsdcBalance}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                    disabled={isWalletLoading}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Wallet content */}
            <div className="p-6 space-y-6">
              {/* Wallet keys section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Your Wallet Details</h3>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600">Public Key</p>
                    <button
                      onClick={() => copyToClipboard(user?.publicKey || '')}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-800 mr-2 font-mono">
                      {user?.publicKey ? truncateAddress(user.publicKey) : 'Not connected'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(user?.publicKey || '')}
                      className="text-gray-500 hover:text-gray-700 text-xs underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600">Tiplink URL</p>
                    <button
                      onClick={() => copyToClipboard(user?.tiplinkUrl || '')}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-800 mr-2 font-mono">
                      {user?.tiplinkUrl ? truncateAddress(user.tiplinkUrl) : 'Not available'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(user?.tiplinkUrl || '')}
                      className="text-gray-500 hover:text-gray-700 text-xs underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Info card */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-700">
                <p className="text-sm text-gray-600">Payments will be automatically deposited to this wallet when you win bounties.</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                {/* Disabled "View Transaction History" button */}
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                >
                  <FaHistory className="mr-2" />
                  View Transaction History
                </button>

                {/* Disabled "Withdraw Funds" button */}
                <button
                  onClick={handleWithdrawFunds}
                  disabled
                  className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                >
                  <FaMoneyBillWave className="mr-2" />
                  Withdraw Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;