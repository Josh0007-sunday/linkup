import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaCog, FaUser } from 'react-icons/fa';
import { useAuth } from './AUTH/page';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-subtle border-b border-gray-100 p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/homepage" className="text-xl font-bold text-gray-800">LinkUp</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/bounties" className="text-gray-600 hover:text-gray-900 transition-colors">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Earn</span>
          </Link>
          <Link to="/serviceList" className="text-gray-600 hover:text-gray-900 transition-colors">Services</Link>
          <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">Profile</Link>
          <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors">Create Ads</Link>
          {/* <Link to="/odessy" className="text-gray-600 hover:text-gray-900 transition-colors">Odessy Season 1</Link> */}
        </div>

        {/* Desktop Profile and Wallet Section */}
        <div className="hidden md:flex space-x-4 items-center relative">
          {user ? (
            <>
              <WalletMultiButton />

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
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Earn</span>
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
            <Link
              to="/odessy"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={toggleMenu}
            >
              Odessy Season 1
            </Link>

            {/* Mobile Profile and Wallet Section */}
            {user ? (
              <>
                <WalletMultiButton className="w-full text-center" />
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
    </nav>
  );
};

export default Navbar;