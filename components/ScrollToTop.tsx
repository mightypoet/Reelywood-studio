
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      if (scrolled > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-50 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#3b82f6] shadow-[0_10px_25px_rgba(59,130,246,0.5)] border-2 border-white transition-all hover:scale-110 active:scale-95 overflow-hidden"
        aria-label="Scroll to top"
      >
        {/* Shine Effect */}
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
        
        {/* Icon */}
        <ChevronUp 
          size={28} 
          strokeWidth={4}
          className="relative z-10 text-white group-hover:-translate-y-1 transition-transform" 
        />
      </button>
    </div>
  );
};
