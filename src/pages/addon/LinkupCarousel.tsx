import React, { useState, useEffect } from "react";
import { User, Award } from "lucide-react";
import { Link } from "react-router-dom";

const LinkUpCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      title: "Welcome to LinkUp! 🎉",
      description:
        "Join our community and shine! Update your profile to unlock opportunities.",
      buttonText: "Update Profile",
      buttonLink: "/update-profile",
      icon: <User className="text-pink-500" size={32} />,
      bgGradient: "from-indigo-200 via-purple-100 to-pink-100",
    },
    {
      title: "Earn Rewards on LinkUp! 🚀",
      description:
        "Complete your profile for personalized recommendations and rewards!",
      buttonText: "Explore Now",
      buttonLink: "/bounties",
      icon: <Award className="text-yellow-500" size={32} />,
      bgGradient: "from-yellow-100 via-pink-100 to-indigo-200",
    },
  ];

  // Delay appearance by 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    });
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [isVisible, slides.length]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full mb-8">
      <div className="overflow-hidden rounded-xl shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`min-w-full bg-gradient-to-r ${slide.bgGradient} rounded-xl p-6 flex items-center justify-center transform transition-all duration-300 hover:scale-102`}
            >
              <div className="text-center max-w-lg mx-auto">
                <div className="inline-block bg-white p-3 rounded-full shadow-md animate-bounce mb-4">
                  {slide.icon}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 animate-pulse">
                  {slide.title}
                </h3>
                <p className="text-base text-gray-800 mb-4 font-medium">
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {slide.buttonText} ✨
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? "bg-pink-500" : "bg-indigo-300"
            } transition-colors duration-200`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LinkUpCarousel;