import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { supabase } from './lib/clients';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { UVP } from './components/UVP';
import { BrandDNA } from './components/BrandDNA';
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
import { CreatorCardView } from './components/CreatorCardView';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AcademyView } from './components/AcademyView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AIAssistant } from './components/AIAssistant';

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com'];

const MainContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth' | 'creator-card' | 'admin-login' | 'admin-dashboard' | 'academy' | 'dashboard'>('home');
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('reelywood-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const { user } = useAuth();

  useEffect(() => {
    // Fixed: onAuthStateChanged is correctly imported from firebase/auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          if (!supabase) return;
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('firebase_uid', user.uid)
            .single();

          if (!existingUser) {
            await supabase
              .from('profiles')
              .insert([{
                firebase_uid: user.uid,
                email: user.email || "no-email",
                role: 'user',
                card_status: 'none',
                reelcoins: 0,
                display_name: user.displayName || 'Agent ' + user.uid.substring(0, 5),
                photo_url: user.photoURL || null
              }]);
          }
        } catch (err) {
          console.error("CRITICAL ERROR:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsVisible(true);
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') setView('admin-login');
      else if (path === '/dashboard' || hash === '#dashboard') setView('dashboard');
      else if (path === '/creatorcard' || hash === '#creatorcard') setView('creator-card');
      else if (path === '/academy' || hash === '#academy') setView('academy');
      else setView('home');
    };
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('reelywood-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (view === 'auth') return <AuthView onBack={() => setView('home')} />;
  if (view === 'creator-card') return <CreatorCardView onBack={() => setView('home')} />;
  if (view === 'dashboard' && user) return <DashboardView onBack={() => setView('home')} />;
  if (view === 'academy') return <AcademyView onBack={() => setView('home')} />;
  if (view === 'admin-login') return <AdminLogin onBack={() => setView('home')} onSuccess={() => setView('admin-dashboard')} />;
  if (view === 'admin-dashboard') return <AdminDashboard onLogout={() => setView('home')} />;

  return (
    <div className={`min-h-screen transition-all duration-700 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar 
        onAuthClick={() => setView('auth')} 
        onThemeToggle={toggleTheme} 
        currentTheme={theme} 
        onDashboardClick={() => setView('dashboard')} 
      />
      <main>
        <Hero onAuthClick={() => setView('auth')} onDashboardClick={() => setView('dashboard')} />
        <Trust />
        <About onAcademyClick={() => setView('academy')} />
        <UVP />
        <BrandDNA />
        <ExpertiseSection />
        <Leaderboard />
        <CreatorVerse onEnterUniverse={() => setView('dashboard')} />
        <Engagement />
        <DorkyProject />
        <Pricing />
        <CTA />
      </main>
      <Footer onAdminClick={() => setView('admin-login')} />
      <div className="fixed bottom-8 left-8 z-[100]">
        <AIAssistant />
      </div>
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