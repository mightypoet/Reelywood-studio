
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
  onThemeToggle: () => void;
  currentTheme: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick, onThemeToggle, currentTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Creators', href: '#creators' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Explore', href: '#explore' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-6 pointer-events-none">
      <nav 
        className="mx-auto max-w-5xl pointer-events-auto bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-2 px-6 rounded-none transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center">
               <div className="w-4 h-4 bg-black"></div>
            </div>
            <span className="font-black text-sm tracking-tight uppercase text-black font-display">
              REELYWOOD
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6 mr-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-[10px] font-black uppercase tracking-widest text-black hover:text-[#834bf1] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Theme Toggle - Square box from screenshot */}
            <button 
              onClick={onThemeToggle}
              className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {currentTheme === 'light' ? <Moon size={18} className="text-black" /> : <Sun size={18} className="text-black" />}
            </button>

            {/* Menu Button - Yellow box from screenshot */}
            <button 
              className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-[#ffde59] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {user && (
              <button onClick={logout} className="hidden sm:flex w-10 h-10 items-center justify-center border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 pt-4 border-t-[3px] border-black flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)} 
                className="text-sm font-black text-black tracking-widest uppercase py-1"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};
