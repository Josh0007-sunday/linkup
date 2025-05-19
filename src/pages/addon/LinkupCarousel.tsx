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
      icon: <User className="text-purple-400" size={24} />,
      bgGradient: "from-purple-900/50 via-purple-800/50 to-pink-900/50",
    },
    {
      title: "Earn Rewards on LinkUp! 🚀",
      description:
        "Complete your profile for personalized recommendations and rewards!",
      buttonText: "Explore Now",
      buttonLink: "/bounties",
      icon: <Award className="text-purple-400" size={24} />,
      bgGradient: "from-purple-900/50 via-pink-800/50 to-purple-900/50",
    },
    {
      title: "POWERED BY MOVEMENT LABS",
      description:
        "Building the future of web3 with movement and scaling oppturnities.",
      buttonText: "Learn More",
      buttonLink: "https://movementlabs.xyz",
      icon: null,
      bgGradient: "from-purple-900/50 via-purple-800/50 to-pink-900/50",
      customStyle: "text-left pl-6",
    },
  ];

  // Delay appearance by 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible, slides.length]);

  if (!isVisible) return null;

  return (
    <div className="relative max-w-4xl mx-auto mb-6">
      <div className="overflow-hidden rounded-xl backdrop-blur-sm border border-purple-500/30">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`min-w-full bg-gradient-to-r ${slide.bgGradient} rounded-xl p-4 flex items-center transform transition-all duration-300 hover:scale-[1.02] ${slide.customStyle || ''}`}
            >
              {index === slides.length - 1 ? (
                // Special layout for Movement Labs slide
                <div className="flex items-center gap-4 w-full">
                  <div className="relative flex-shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2Ri8Ig7GxGfptoghWNev6UQYMqgTZOWsqWw&s" 
                      alt="Movement Labs" 
                      className="w-16 h-16 object-contain"
                    />
                    <img 
                      src={usdc} 
                      alt="USDC" 
                      className="absolute -top-1 -right-1 w-6 h-6 object-contain animate-spin-slow"
                      style={{ animationDuration: '8s' }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 uppercase tracking-tight">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-3 max-w-md">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.buttonLink}
                      target={slide.buttonLink.startsWith('http') ? '_blank' : '_self'}
                      className="inline-block bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm border border-purple-500/30"
                    >
                      {slide.buttonText} →
                    </Link>
                  </div>
                </div>
              ) : (
                // Standard layout for other slides
                <div className={`max-w-md mx-auto ${slide.customStyle ? 'text-left' : 'text-center'}`}>
                  <div className="inline-block bg-purple-500/20 p-2 rounded-full mb-3">
                    {slide.icon}
                  </div>
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {slide.description}
                  </p>
                  <Link
                    to={slide.buttonLink}
                    target={slide.buttonLink.startsWith('http') ? '_blank' : '_self'}
                    className="inline-block bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm border border-purple-500/30"
                  >
                    {slide.buttonText} →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-3 space-x-1.5">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 w-1.5 rounded-full ${
              index === currentIndex ? "bg-purple-400" : "bg-purple-500/30"
            } transition-colors duration-200`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LinkUpCarousel;