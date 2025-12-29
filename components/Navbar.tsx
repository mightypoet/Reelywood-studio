import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Database, LogOut, Bell, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface NavbarProps {
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const exploreRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Notification Listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'creator_applications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(apps);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
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
    return 'bg-white/5 backdrop-blur-xl border-white/10 py-4 px-6 lg:px-8';
  };

  const unreadCount = notifications.filter(n => n.status === 'approved' && !n.notified).length;

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
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex items-center space-x-4 ml-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Notification Bell */}
                  <div className="relative" ref={notificationsRef}>
                    <button 
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className={`p-2 rounded-full transition-colors relative ${isDarkBase ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-[#5F6368] hover:text-indigo-600 hover:bg-slate-100'}`}
                    >
                      <Bell size={18} />
                      {notifications.some(n => n.status === 'approved') && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Hub</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-10 text-center space-y-3">
                              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Bell size={20} />
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No application history found on this node.</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                  {n.status === 'approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {n.status === 'approved' ? 'Reelywood Card Approved!' : 'Card sync is pending review.'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium">Protocol ID: #{n.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border transition-colors ${isDarkBase ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="Profile" className="w-7 h-7 rounded-full border border-white/20 shadow-sm" />
                    <button onClick={logout} className={`${isDarkBase ? 'text-white/60 hover:text-rose-400' : 'text-[#5F6368] hover:text-rose-500'} transition-colors flex items-center space-x-2`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                      <LogOut size={16} />
                    </button>
                  </div>
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