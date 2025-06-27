import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Board game board background */}
        <rect width="48" height="48" rx="8" fill="#F97316" />
        
        {/* Game board squares */}
        <rect x="6" y="6" width="9" height="9" fill="#FED7AA" />
        <rect x="15" y="15" width="9" height="9" fill="#FED7AA" />
        <rect x="24" y="6" width="9" height="9" fill="#FED7AA" />
        <rect x="33" y="15" width="9" height="9" fill="#FED7AA" />
        <rect x="6" y="24" width="9" height="9" fill="#FED7AA" />
        <rect x="15" y="33" width="9" height="9" fill="#FED7AA" />
        <rect x="24" y="24" width="9" height="9" fill="#FED7AA" />
        <rect x="33" y="33" width="9" height="9" fill="#FED7AA" />
        
        {/* Dice dots */}
        <circle cx="10.5" cy="10.5" r="1.5" fill="#7C2D12" />
        <circle cx="28.5" cy="10.5" r="1.5" fill="#7C2D12" />
        <circle cx="19.5" cy="19.5" r="1.5" fill="#7C2D12" />
        <circle cx="37.5" cy="19.5" r="1.5" fill="#7C2D12" />
        <circle cx="10.5" cy="28.5" r="1.5" fill="#7C2D12" />
        <circle cx="28.5" cy="28.5" r="1.5" fill="#7C2D12" />
        <circle cx="19.5" cy="37.5" r="1.5" fill="#7C2D12" />
        <circle cx="37.5" cy="37.5" r="1.5" fill="#7C2D12" />
        
        {/* Meeple shape in center */}
        <path
          d="M24 16C22.3431 16 21 17.3431 21 19C21 19.5304 21.2107 20.0391 21.5858 20.4142C21.9609 20.7893 22.4696 21 23 21V26H21V30H27V26H25V21C25.5304 21 26.0391 20.7893 26.4142 20.4142C26.7893 20.0391 27 19.5304 27 19C27 17.3431 25.6569 16 24 16Z"
          fill="white"
          opacity="0.9"
        />
      </svg>
      
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          JP's Boardgame Tracker
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Cool boardgame inspired site
        </p>
      </div>
    </div>
  );
};

export default Logo;