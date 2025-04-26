import React, { useState, useEffect } from "react";
import { User, Award } from "lucide-react";
import { Link } from "react-router-dom";
import usdc from '../../assets/usdc.png';

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
    {
      title: "POWERED BY MOVEMENT LABS",
      description:
        "Building the future of web3 with movement and scaling oppturnities.",
      buttonText: "Learn More",
      buttonLink: "https://movementlabs.xyz",
      icon: null,
      bgGradient: "from-yellow-400 via-yellow-300 to-yellow-200",
      customStyle: "text-left pl-8",
    },
  ];

  // Delay appearance by 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    },);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
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
              className={`min-w-full bg-gradient-to-r ${slide.bgGradient} rounded-xl p-6 flex items-center transform transition-all duration-300 hover:scale-102 ${slide.customStyle || ''}`}
            >
              {index === slides.length - 1 ? (
                // Special layout for Movement Labs slide
                <div className="flex items-center gap-8 w-full">
                  <div className="relative flex-shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2Ri8Ig7GxGfptoghWNev6UQYMqgTZOWsqWw&s" 
                      alt="Movement Labs" 
                      className="w-24 h-24 object-contain" // Increased from w-16 h-16
                    />
                    <img 
                      src={usdc} 
                      alt="USDC" 
                      className="absolute -top-2 -right-2 w-8 h-8 object-contain animate-spin-slow"
                      style={{ animationDuration: '8s' }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">
                      {slide.title}
                    </h3>
                    <p className="text-lg text-gray-800 mb-4 font-medium max-w-md"> {/* Increased text size */}
                      {slide.description}
                    </p>
                    <Link
                      to={slide.buttonLink}
                      target={slide.buttonLink.startsWith('http') ? '_blank' : '_self'}
                      className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-lg" // Increased button size
                    >
                      {slide.buttonText} →
                    </Link>
                  </div>
                </div>
              ) : (
                // Standard layout for other slides
                <div className={`max-w-lg mx-auto ${slide.customStyle ? 'text-left' : 'text-center'}`}>
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
                    target={slide.buttonLink.startsWith('http') ? '_blank' : '_self'}
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {slide.buttonText} ✨
                  </Link>
                </div>
              )}
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