import React from 'react';

interface SkeletonProps {
  type: 'text' | 'image' | 'circle' | 'job' | 'profile';
  className?: string;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({ type, className = '' }) => {
  const baseClasses = 'animate-pulse bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/20';

  switch (type) {
    case 'text':
      return (
        <div className={`h-4 ${baseClasses} ${className}`} />
      );

    case 'image':
      return (
        <div className={`w-full ${baseClasses} ${className}`} />
      );

    case 'circle':
      return (
        <div className={`rounded-full ${baseClasses} ${className}`} />
      );

    case 'job':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className={`h-5 w-3/4 ${baseClasses}`} />
          <div className={`h-4 w-1/2 ${baseClasses}`} />
          <div className="flex gap-2">
            <div className={`h-6 w-20 ${baseClasses}`} />
            <div className={`h-6 w-20 ${baseClasses}`} />
          </div>
        </div>
      );

    case 'profile':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full ${baseClasses}`} />
            <div className="space-y-2 flex-1">
              <div className={`h-5 w-1/3 ${baseClasses}`} />
              <div className={`h-4 w-1/4 ${baseClasses}`} />
            </div>
          </div>
          <div className="space-y-2">
            <div className={`h-4 w-full ${baseClasses}`} />
            <div className={`h-4 w-3/4 ${baseClasses}`} />
          </div>
          <div className="flex gap-4">
            <div className={`h-8 w-8 rounded-full ${baseClasses}`} />
            <div className={`h-8 w-8 rounded-full ${baseClasses}`} />
            <div className={`h-8 w-8 rounded-full ${baseClasses}`} />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default LoadingSkeleton; 