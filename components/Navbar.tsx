
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Database, LogOut, Bell, CheckCircle2, Clock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface NavbarProps {
  onAuthClick: () => void;
  onThemeToggle: () => void;
  currentTheme: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick, onThemeToggle, currentTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const { user, logout } = useAuth();
  const exploreRef = useRef<HTMLDivElement>(null);

  const LOGO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%281%29.mp4";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-6 pointer-events-none">
      <nav 
        className={`
          mx-auto max-w-5xl pointer-events-auto
          transition-all duration-300 relative
          bg-white dark:bg-[#0a0a0a] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]
          py-3 px-6 rounded-none
        `}
      >
        <div className="relative flex items-center justify-between z-10">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="w-8 h-8 border-2 border-black dark:border-white overflow-hidden bg-white">
              <video 
                src={LOGO_URL} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-black text-sm tracking-tighter uppercase text-black dark:text-white font-display">
              REELYWOOD
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div key={link.name} className="relative" ref={link.isExplore ? exploreRef : null}>
                <button 
                  onClick={(e) => link.isExplore ? (e.preventDefault(), setExploreOpen(!exploreOpen)) : null}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white hover:text-[#834bf1] dark:hover:text-[#ffde59] transition-colors"
                >
                  {link.isExplore ? (
                    <span className="flex items-center space-x-1">
                      <span>{link.name}</span>
                      <ChevronDown size={12} />
                    </span>
                  ) : (
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>{link.name}</a>
                  )}
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button 
                onClick={onThemeToggle}
                className="p-2 border-2 border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-[#ffde59] dark:hover:bg-[#834bf1] transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                title="Toggle Theme"
              >
                {currentTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {user ? (
                <button onClick={logout} className="p-2 border-2 border-black dark:border-white bg-[#ffde59] hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  <LogOut size={16} className="text-black dark:text-white" />
                </button>
              ) : (
                <button 
                  onClick={onAuthClick}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_#834bf1] dark:shadow-[4px_4px_0px_0px_#ffde59] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle & Theme Toggle for Mobile */}
          <div className="flex items-center space-x-3 lg:hidden">
             <button 
                onClick={onThemeToggle}
                className="p-2 border-[3px] border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                {currentTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            <button 
              className="w-10 h-10 flex items-center justify-center border-[3px] border-black dark:border-white bg-[#ffde59] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t-2 border-black dark:border-white flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)} 
                className="text-sm font-black text-black dark:text-white tracking-widest uppercase"
              >
                {link.name}
              </a>
            ))}
            {!user && (
              <button 
                onClick={onAuthClick}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#834bf1]"
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
