import React from 'react';

const GeometricOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[7]">
      {/* Floating Rotating Lines */}
      <div className="absolute top-[15%] left-[10%] w-[300px] h-[1px] bg-white/10 rotate-[30deg] animate-slow-float"></div>
      <div className="absolute top-[60%] right-[15%] w-[400px] h-[1px] bg-white/5 rotate-[-15deg] animate-slow-float-delayed"></div>
      
      {/* Shimmering Particle Clusters */}
      <div className="absolute top-[20%] right-[25%] flex space-x-12 opacity-20">
        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-700"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="absolute bottom-[20%] left-[20%] flex space-x-16 opacity-10">
        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Outlined Geometric Shapes */}
      <div className="absolute top-[40%] left-[5%] w-32 h-32 border border-white/5 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-[10%] right-[5%] w-48 h-48 border border-white/5 rounded-[2rem] animate-spin-slow-reverse"></div>

      <style>{`
        @keyframes slow-float {
          0%, 100% { transform: translateY(0) rotate(30deg); }
          50% { transform: translateY(-20px) rotate(35deg); }
        }
        @keyframes slow-float-delayed {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(20px) rotate(-10deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-slow-float {
          animation: slow-float 8s ease-in-out infinite;
        }
        .animate-slow-float-delayed {
          animation: slow-float-delayed 12s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 35s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GeometricOverlay;
