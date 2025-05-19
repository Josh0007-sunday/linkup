import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface ProfileUpdatePopupProps {
  onClose: () => void;
}

const ProfileUpdatePopup = ({ onClose }: ProfileUpdatePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem("profilePopupLastClosed");
    const currentTime = Date.now() / 1000; // Current time in seconds
    const twoHoursInSeconds = 7200; // 2 hours

    // Check if popup should be shown (no lastClosed or 2 hours have passed)
    if (!lastClosed || currentTime - parseFloat(lastClosed) >= twoHoursInSeconds) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // 3-second delay for first appearance
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("profilePopupLastClosed", (Date.now() / 1000).toString()); // Store close time in seconds
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 max-w-md w-full mx-4 transform transition-all duration-500 scale-100 hover:scale-105">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            Level Up Your Profile! 🚀
          </h2>
          <button
            onClick={handleClose}
            className="text-purple-400 hover:text-purple-300 focus:outline-none transition-colors duration-200"
          >
            <span className="text-3xl font-bold">×</span>
          </button>
        </div>
        <div className="space-y-6">
          <p className="text-white font-medium">
            <span className="inline-block mr-3 transform hover:rotate-12 transition-transform duration-200">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </span>
            Stand out in the web3 space with a fresh profile to unlock amazing opportunities!
          </p>
          <p className="text-white font-medium">
            <span className="inline-block mr-3 transform hover:rotate-12 transition-transform duration-200">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </span>
            Showcase your latest web3 skills and projects to the community! 🌟
          </p>
        </div>
        <div className="mt-8 flex justify-end">
          <Link
            to="/update-profile"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 border border-purple-500/20"
          >
            Update Now! ✨
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdatePopup;