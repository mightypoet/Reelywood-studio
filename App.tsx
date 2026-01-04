
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { UVP } from './components/UVP';
import { Pricing } from './components/Pricing';
import { ExpertiseSection } from './components/ExpertiseSection';
import { Leaderboard } from './components/Leaderboard';
import { CreatorVerse } from './components/CreatorVerse';
import { Engagement } from './components/Engagement';
import { DorkyProject } from './components/DorkyProject';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AuthView } from './components/AuthView';
import { Trust } from './components/Trust';
import { ScrollToTop } from './components/ScrollToTop';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AcademyView } from './components/AcademyView';

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com'];

const MainContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth' | 'dashboard' | 'admin-login' | 'admin-dashboard' | 'academy'>('home');
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('reelywood-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/admin' || path === '/admin/login' || hash === '#admin') {
        setView('admin-login');
      } else if (path === '/admin-dashboard' || hash === '#admin-dashboard') {
        setView('admin-dashboard');
      } else if (path === '/dashboard' || hash === '#dashboard') {
        setView('dashboard');
      } else if (path === '/academy' || hash === '#academy') {
        setView('academy');
      } else {
        setView('home');
      }
    };

    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('reelywood-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAuthRedirect = () => {
    if (user) {
      setView('dashboard');
      window.history.pushState({}, '', '/dashboard');
    } else {
      setView('auth');
      window.history.pushState({}, '', '/auth');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAcademyClick = () => {
    setView('academy');
    window.history.pushState({}, '', '/academy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setView('admin-login');
    window.history.pushState({}, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'auth') {
    return <AuthView onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
  }

  if (view === 'dashboard') {
    if (!user) {
      return <AuthView onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
    }
    return <CreatorDashboard onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
  }

  if (view === 'academy') {
    return <AcademyView onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
  }

  if (view === 'admin-login') {
    return <AdminLogin onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} onSuccess={() => setView('admin-dashboard')} />;
  }

  if (view === 'admin-dashboard') {
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return <AdminLogin onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} onSuccess={() => setView('admin-dashboard')} />;
    }
    return <AdminDashboard onLogout={() => {
      setView('home');
      window.history.pushState({}, '', '/');
    }} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-700 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar onAuthClick={handleAuthRedirect} onThemeToggle={toggleTheme} currentTheme={theme} />
      <main>
        <section id="home" className="scroll-mt-24">
          <Hero onAuthClick={handleAuthRedirect} />
        </section>
        
        <Trust />
        
        <section id="about" className="scroll-mt-24">
          <About onApplyClick={handleAuthRedirect} onAcademyClick={handleAcademyClick} />
        </section>

        <UVP />
        
        <ExpertiseSection />
        
        <section id="leaderboard" className="scroll-mt-24">
          <Leaderboard />
        </section>

        <section id="creators" className="scroll-mt-24">
          <CreatorVerse onEnterUniverse={handleAuthRedirect} />
        </section>
        
        <Engagement />
        
        <section id="explore" className="scroll-mt-24">
          <DorkyProject />
        </section>

        <section id="pricing" className="scroll-mt-24">
          <Pricing />
        </section>
        
        <section id="contact" className="scroll-mt-24">
          <CTA onApplyClick={handleAuthRedirect} />
        </section>
      </main>
      <Footer onAdminClick={navigateToAdmin} />
      <ScrollToTop />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
