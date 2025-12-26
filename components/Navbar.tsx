
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Database, LogOut } from 'lucide-react';
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
    { name: 'Creators', href: '#creators' },
    { name: 'Pricing', href: '#pricing' },
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

  const isDarkBase = !scrolled && !mobileMenuOpen;

  const getNavbarStyles = () => {
    if (mobileMenuOpen) {
      return 'bg-white border-slate-200 shadow-2xl py-3 px-5 lg:px-6';
    }
    if (scrolled) {
      return 'bg-white/75 backdrop-blur-md border-slate-200 shadow-xl py-3 px-5 lg:px-6';
    }
    // Transparent state over Dark Hero
    return 'bg-white/5 backdrop-blur-xl border-white/10 py-4 px-6 lg:px-8';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4 lg:pt-6 pointer-events-none">
      <nav 
        className={`
          mx-auto max-w-5xl pointer-events-auto
          transition-all duration-300 relative
          rounded-2xl lg:rounded-[2.5rem] border
          ${getNavbarStyles()}
        `}
      >
        <div className="relative flex items-center justify-between z-10">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-base lg:text-lg">R</span>
            </div>
            <span className={`font-bold text-xs lg:text-base tracking-tighter uppercase transition-colors ${isDarkBase ? 'text-white' : 'text-[#202124]'}`}>
              REELYWOODSTUDIO
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <div key={link.name} className="relative" ref={link.isExplore ? exploreRef : null}>
                <button 
                  onClick={(e) => link.isExplore ? (e.preventDefault(), setExploreOpen(!exploreOpen)) : null}
                  onMouseEnter={() => link.isExplore && setExploreOpen(true)}
                  className={`
                    text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center space-x-1 py-1
                    ${exploreOpen && link.isExplore ? 'text-indigo-400' : isDarkBase ? 'text-white/60 hover:text-white' : 'text-[#5F6368] hover:text-indigo-600'}
                  `}
                >
                  {link.isExplore ? (
                    <>
                      <span>{link.name}</span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${exploreOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>{link.name}</a>
                  )}
                </button>

                {/* Explore Dropdown */}
                {link.isExplore && exploreOpen && (
                  <div 
                    onMouseLeave={() => setExploreOpen(false)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200 origin-top"
                  >
                    <div className="bg-[#FEEFC3] p-5 rounded-2xl mb-4 border border-amber-100">
                      <div className="flex items-center space-x-2 text-[#202124] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Database size={14} className="text-amber-500" />
                        <span>Labs Stack</span>
                      </div>
                      <p className="text-[#5F6368] text-[11px] leading-relaxed font-medium">
                        Growing tools built to help SMEs with marketing and execution.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-2xl border border-transparent opacity-60">
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
                <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border transition-colors ${isDarkBase ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="Profile" className="w-7 h-7 rounded-full" />
                  <button onClick={logout} className={`${isDarkBase ? 'text-white/60 hover:text-rose-400' : 'text-[#5F6368] hover:text-rose-500'} transition-colors flex items-center space-x-2`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onAuthClick}
                  className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md ${isDarkBase ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${isDarkBase ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#202124]'}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-slate-200/50 flex flex-col space-y-5 animate-in slide-in-from-top-2 duration-200 opacity-100 bg-transparent">
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
                    <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded font-black">SOON</span>
                  </div>
                )}
              </div>
            ))}
            {user ? (
               <button 
               className="bg-rose-50/50 text-rose-600 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.3em] border border-rose-100/50 flex items-center justify-center space-x-2" 
               onClick={() => { setMobileMenuOpen(false); logout(); }}
             >
               <LogOut size={16} />
               <span>Logout</span>
             </button>
            ) : (
              <button 
                className="bg-indigo-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-md" 
                onClick={() => { setMobileMenuOpen(false); onAuthClick(); }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};
