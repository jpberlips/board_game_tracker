import React, { useState, useRef, useEffect } from 'react';

function LazyImage({ src, alt, className, placeholder }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          {!isLoaded && (
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 animate-pulse flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            style={{ display: isLoaded ? 'block' : 'none' }}
          />
        </>
      )}
      {!isInView && (
        <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 animate-pulse flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default LazyImage;