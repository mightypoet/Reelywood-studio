
import React, { useState } from 'react';
import { Menu, X, LogOut, Sun, Moon, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
  onThemeToggle: () => void;
  currentTheme: 'light' | 'dark';
  onDashboardClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick, onThemeToggle, currentTheme, onDashboardClick }) => {
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

  const LOGO_VIDEO = "https://gkaffrpzczamnawhmlph.supabase.co/storage/v1/object/public/brand-assets/OWLLOGO.mp4";

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-2 sm:px-4 pt-4 sm:pt-6 pointer-events-none">
      <nav 
        className="mx-auto max-w-[1400px] pointer-events-auto bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] py-2 px-3 sm:px-6 rounded-none transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="w-10 h-10 border-[3px] border-black bg-white overflow-hidden flex items-center justify-center transition-transform hover:scale-105">
               <video 
                src={LOGO_VIDEO} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
               />
            </div>
            <span className="font-black text-sm sm:text-base tracking-tight uppercase text-black font-display italic">
              REELYWOOD
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-6 mr-4">
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

            {/* Auth Action */}
            {user ? (
              <button 
                onClick={onDashboardClick}
                className="w-10 h-10 border-[3px] border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all group"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <UserIcon size={20} className="text-black" />
                  </div>
                )}
              </button>
            ) : (
              <button 
                onClick={onAuthClick}
                className="bg-white text-black px-6 h-10 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] font-black uppercase tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                LOGIN
              </button>
            )}

            {/* Theme Toggle */}
            <button 
              onClick={onThemeToggle}
              className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {currentTheme === 'light' ? <Moon size={18} className="text-black" /> : <Sun size={18} className="text-black" />}
            </button>

            {/* Menu Button */}
            <button 
              className="w-10 h-10 flex items-center justify-center border-[3px] border-black bg-[#ffde59] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 pt-4 border-t-[3px] border-black flex flex-col space-y-4 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)} 
                className="text-xs font-black text-black tracking-widest uppercase py-1 hover:text-[#834bf1]"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-black/10 flex flex-col space-y-3">
              {user ? (
                <>
                  <button 
                    onClick={onDashboardClick}
                    className="text-xs font-black text-[#834bf1] uppercase tracking-widest text-left flex items-center space-x-2"
                  >
                    <LayoutDashboard size={14} />
                    <span>Go to Dashboard</span>
                  </button>
                  <button 
                    onClick={logout} 
                    className="text-xs font-black text-rose-600 uppercase tracking-widest text-left flex items-center space-x-2"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={onAuthClick}
                  className="text-xs font-black text-black uppercase tracking-widest text-left"
                >
                  Join the Universe
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
