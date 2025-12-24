
import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkle, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dorky.ai', href: '#dorky', featured: true },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Work', href: '#clients' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm border-b' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">REELYWOOD</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`font-medium transition-colors flex items-center space-x-1 ${link.featured ? 'text-amber-600 hover:text-amber-700 font-bold' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              {link.featured && <Sparkle size={14} className="animate-pulse" />}
              <span>{link.name}</span>
            </a>
          ))}
          
          {user ? (
            <div className="flex items-center space-x-4 border-l pl-8 border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border border-indigo-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">{user.displayName?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400">Pro Client</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold flex items-center space-x-2 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-100"
            >
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b shadow-xl p-6 flex flex-col space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`text-lg font-semibold ${link.featured ? 'text-amber-600' : 'text-slate-700'}`} 
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {!user ? (
            <button 
              className="bg-indigo-600 text-white text-center py-4 rounded-xl font-bold"
              onClick={() => {
                setMobileMenuOpen(false);
                onAuthClick();
              }}
            >
              Join Reelywood
            </button>
          ) : (
            <button 
              onClick={logout}
              className="bg-rose-50 text-rose-600 text-center py-4 rounded-xl font-bold"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
