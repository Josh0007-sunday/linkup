import React from 'react';

interface SkeletonProps {
  type: 'article' | 'profile' | 'job' | 'text' | 'image';
  className?: string;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({ type, className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  switch (type) {
    case 'article':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className={`h-48 w-full ${baseClasses}`} />
          <div className="space-y-2">
            <div className={`h-6 w-3/4 ${baseClasses}`} />
            <div className={`h-4 w-full ${baseClasses}`} />
            <div className={`h-4 w-2/3 ${baseClasses}`} />
          </div>
          <div className="flex items-center space-x-4">
            <div className={`h-8 w-8 rounded-full ${baseClasses}`} />
            <div className={`h-4 w-24 ${baseClasses}`} />
          </div>
        </div>
      );

    case 'profile':
      return (
        <div className={`flex items-center space-x-4 ${className}`}>
          <div className={`h-12 w-12 rounded-full ${baseClasses}`} />
          <div className="space-y-2">
            <div className={`h-4 w-32 ${baseClasses}`} />
            <div className={`h-3 w-24 ${baseClasses}`} />
          </div>
        </div>
      );

    case 'job':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className={`h-5 w-3/4 ${baseClasses}`} />
          <div className={`h-4 w-1/2 ${baseClasses}`} />
          <div className="space-y-2">
            <div className={`h-3 w-full ${baseClasses}`} />
            <div className={`h-3 w-2/3 ${baseClasses}`} />
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          <div className={`h-4 w-full ${baseClasses}`} />
          <div className={`h-4 w-5/6 ${baseClasses}`} />
          <div className={`h-4 w-4/6 ${baseClasses}`} />
        </div>
      );

    case 'image':
      return (
        <div className={`aspect-video w-full ${baseClasses} ${className}`} />
      );

    default:
      return null;
  }
};

export default LoadingSkeleton; 