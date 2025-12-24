
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Rocket, Database, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const { user, logout } = useAuth();
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Explore', href: '#explore', isExplore: true },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
      setExploreOpen(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-6 pointer-events-none">
      <nav 
        className={`
          mx-auto max-w-5xl pointer-events-auto
          transition-all duration-700 ease-out relative
          rounded-[2.5rem] border
          ${scrolled 
            ? 'bg-white/70 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.4)] py-3 px-6' 
            : 'bg-white/40 backdrop-blur-lg border-white/20 shadow-none py-4 px-8'
          }
        `}
      >
        {/* Liquid Shimmer Effect */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-liquid-flow bg-[conic-gradient(from_0deg,transparent,rgba(79,70,229,0.2),transparent,rgba(79,70,229,0.1),transparent)]"></div>
        </div>

        <div className="relative flex items-center justify-between z-10">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#1A73E8] to-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:rotate-[15deg] transition-all duration-500">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="font-bold text-sm lg:text-base tracking-tighter text-[#202124] uppercase">REELYWOODSTUDIO</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <div key={link.name} className="relative" ref={link.isExplore ? exploreRef : null}>
                <a 
                  href={link.href} 
                  onClick={(e) => link.isExplore ? (e.preventDefault(), setExploreOpen(!exploreOpen)) : handleLinkClick(e, link.href)}
                  onMouseEnter={() => link.isExplore && setExploreOpen(true)}
                  className={`
                    text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center space-x-1 py-1
                    ${exploreOpen && link.isExplore ? 'text-[#1A73E8]' : 'text-[#5F6368] hover:text-[#1A73E8] hover:scale-105'}
                  `}
                >
                  <span>{link.name}</span>
                  {link.isExplore && <ChevronDown size={14} className={`transition-transform duration-500 ${exploreOpen ? 'rotate-180' : ''}`} />}
                </a>

                {/* Explore Dropdown */}
                {link.isExplore && exploreOpen && (
                  <div 
                    onMouseLeave={() => setExploreOpen(false)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-72 bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 p-6 animate-in fade-in zoom-in-95 duration-500 origin-top"
                  >
                    <div className="bg-[#FEEFC3]/50 p-5 rounded-[1.5rem] mb-4 border border-white/50">
                      <div className="flex items-center space-x-2 text-[#202124] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Database size={14} className="text-amber-500" />
                        <span>Labs Stack</span>
                      </div>
                      <p className="text-[#5F6368] text-[11px] leading-relaxed font-medium">
                        Growing tools built to help SMEs with marketing and execution.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-[1.5rem] transition-all border border-transparent opacity-60">
                      <div className="text-2xl">🤓</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-black text-[#202124] uppercase tracking-widest">Dorky.ai</p>
                          <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-black">SOON</span>
                        </div>
                        <p className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider">Lead Intel</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex items-center space-x-4 ml-4">
              {user ? (
                <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="Profile" className="w-7 h-7 rounded-full border border-white" />
                  <button onClick={logout} className="text-[#5F6368] hover:text-rose-500 transition-colors flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onAuthClick}
                  className="group relative bg-[#1A73E8] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-[#1558B0] hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200/50 overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/50 border border-white/40 text-[#202124] pointer-events-auto" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full mt-3 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl p-8 flex flex-col space-y-6 animate-in slide-in-from-top-5 duration-500 pointer-events-auto">
            {navLinks.map((link) => (
              <div key={link.name} className="flex flex-col space-y-2">
                <a 
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)} 
                  className="text-sm font-black text-[#202124] tracking-[0.2em] uppercase flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  {link.isExplore && <span className="bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full text-[9px]">LABS</span>}
                </a>
                {link.isExplore && (
                  <div className="pl-4 opacity-50 flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Dorky.ai</span>
                    <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-black">COMING SOON</span>
                  </div>
                )}
              </div>
            ))}
            {user ? (
               <button 
               className="bg-rose-50 text-rose-600 py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] border border-rose-100 flex items-center justify-center space-x-2" 
               onClick={() => { setMobileMenuOpen(false); logout(); }}
             >
               <LogOut size={16} />
               <span>Logout</span>
             </button>
            ) : (
              <button 
                className="bg-[#1A73E8] text-white py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-indigo-100" 
                onClick={() => { setMobileMenuOpen(false); onAuthClick(); }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @keyframes liquid-flow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-liquid-flow {
          animation: liquid-flow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};
