import React, { useState, useEffect } from 'react';

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;