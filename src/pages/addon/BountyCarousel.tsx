import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Bounty {
  _id: string;
  title: string;
  tag: string;
  status: string;
  total_prizes: number;
  details: string;
  prizes: number[];
  duration: string;
  createdAt: string;
}

interface BountyCarouselProps {
  bounties: Bounty[];
}

const BountyCarousel: React.FC<BountyCarouselProps> = ({ bounties }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const featuredBounties = bounties.slice(0, 3); // Show up to 3 bounties

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (featuredBounties.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === featuredBounties.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredBounties.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredBounties.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredBounties.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (featuredBounties.length === 0) return null;

  return (
    <div className="relative w-full mb-12">
      <div className="overflow-hidden rounded-2xl shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {featuredBounties.map((bounty) => (
            <div
              key={bounty._id}
              className="min-w-full bg-gradient-to-r from-indigo-200 via-pink-100 to-yellow-100 rounded-2xl p-8 cursor-pointer hover:scale-105 transform transition-all duration-300"
              onClick={() => navigate(`/bounties/${bounty._id}`)}
            >
              <div className="flex items-center space-x-6">
                <div className="bg-white p-4 rounded-full shadow-lg animate-bounce">
                  <Award className="text-indigo-700" size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3 animate-pulse">
                    {bounty.title} 🎉
                  </h3>
                  <div className="flex items-center space-x-3 text-sm mb-3">
                    <span className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-xs font-bold">
                      {bounty.tag}
                    </span>
                  </div>
                  <p className="text-base text-gray-800 mb-3 line-clamp-3 font-medium">
                    {bounty.details}
                  </p>
                  <div className="flex items-center space-x-3 text-sm font-semibold text-gray-900">
                    <span>💰 {bounty.total_prizes} USDC</span>
                    <span>•</span>
                    <span>⏰ Due in {bounty.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {featuredBounties.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-indigo-600 p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <ChevronLeft className="text-white" size={28} />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-indigo-600 p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <ChevronRight className="text-white" size={28} />
          </button>
          <div className="flex justify-center mt-6 space-x-3">
            {featuredBounties.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full ${
                  index === currentIndex ? "bg-pink-500" : "bg-indigo-300"
                } transition-colors duration-200`}
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BountyCarousel;