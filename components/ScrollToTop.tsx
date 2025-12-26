
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrolled > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (height > 0) {
        const p = (scrolled / height) * 100;
        setProgress(p);
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

  // SVG Circle properties
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-50 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-2xl border border-slate-100 transition-all hover:scale-110 active:scale-95 overflow-hidden"
        aria-label="Scroll to top"
      >
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Progress Ring */}
        <svg className="absolute -rotate-90 w-full h-full p-1" viewBox="0 0 60 60">
          <circle
            className="text-slate-100"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="30"
            cy="30"
          />
          <circle
            className="text-indigo-600 transition-all duration-200"
            strokeWidth="3"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="30"
            cy="30"
          />
        </svg>

        {/* Icon */}
        <ChevronUp 
          size={24} 
          className="relative z-10 text-indigo-600 group-hover:-translate-y-1 transition-transform" 
        />

        {/* Shine Effect */}
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
      </button>
    </div>
  );
};
