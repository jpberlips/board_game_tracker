import React from 'react';

function GameCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>
      
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-300 rounded mb-3"></div>
        
        {/* Details skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Rankings skeleton */}
        <div className="mt-3 flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="mt-4 flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="h-5 bg-gray-200 rounded w-8"></div>
            <div className="h-5 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCardSkeleton;