
import React, { useEffect, useState, Suspense, lazy } from 'react';
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
import { GamifiedJourney } from './components/GamifiedJourney';
import { CreatorVerse } from './components/CreatorVerse';
import { Engagement } from './components/Engagement';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Trust } from './components/Trust';
import { ScrollToTop } from './components/ScrollToTop';
import { Loader2 } from 'lucide-react';

// Lazy load dashboard components
const DashboardView = lazy(() => import('./components/Dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const BrandDashboard = lazy(() => import('./components/Brands/BrandDashboard').then(m => ({ default: m.BrandDashboard })));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AcademyView = lazy(() => import('./components/AcademyView').then(m => ({ default: m.AcademyView })));
const AdminLogin = lazy(() => import('./components/Admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AuthView = lazy(() => import('./components/AuthView').then(m => ({ default: m.AuthView })));
const CreatorCardView = lazy(() => import('./components/CreatorCardView').then(m => ({ default: m.CreatorCardView })));

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
    <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
    <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Syncing Interface...</p>
  </div>
);

const MainContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth' | 'creator-card' | 'admin-login' | 'admin-dashboard' | 'brand-dashboard' | 'academy' | 'dashboard'>('home');
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('reelywood-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. FAST VIEW TRANSITION (Determine view instantly)
          if (ADMIN_EMAILS.includes(firebaseUser.email || '')) {
             setView('admin-dashboard');
          } else {
             setView('dashboard'); // Default
             if (supabase) {
               supabase
                 .from('partner_brands')
                 .select('id')
                 .eq('brand_email', firebaseUser.email)
                 .maybeSingle()
                 .then(({ data }) => { if (data) setView('brand-dashboard'); });
             }
          }

          // 2. BACKGROUND PROFILE SYNC (Type-safe async execution)
          if (supabase) {
            try {
              await supabase
                .from('profiles')
                .upsert({
                  firebase_uid: firebaseUser.uid,
                  email: firebaseUser.email || "no-email",
                  display_name: firebaseUser.displayName || 'Agent ' + firebaseUser.uid.substring(0, 5),
                  photo_url: firebaseUser.photoURL || null,
                  handle: firebaseUser.displayName?.toLowerCase().replace(/\s/g, '') || firebaseUser.uid.substring(0, 8),
                  updated_at: new Date().toISOString()
                }, { 
                  onConflict: 'firebase_uid',
                  ignoreDuplicates: true 
                });
            } catch (syncErr) {
              console.warn("Background sync deferred:", syncErr);
            }
          }

        } catch (err) {
          console.error("BOOTSTRAP_ERROR:", err);
          setView('dashboard'); // Fail forward
        }
      } else {
        const hash = window.location.hash;
        if (!['#academy', '#creatorcard', '#admin'].includes(hash)) {
          setView('home');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsVisible(true);
    const handleRouting = () => {
      const hash = window.location.hash;
      if (hash === '#admin') setView('admin-login');
      else if (hash === '#brands') setView('brand-dashboard');
      else if (hash === '#dashboard') setView('dashboard');
      else if (hash === '#creatorcard') setView('creator-card');
      else if (hash === '#academy') setView('academy');
    };
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    return () => window.removeEventListener('hashchange', handleRouting);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('reelywood-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <Suspense fallback={<LoadingFallback />}>
      {view === 'auth' && <AuthView onBack={() => setView('home')} />}
      {view === 'creator-card' && <CreatorCardView onBack={() => setView('home')} />}
      {view === 'dashboard' && user && <DashboardView onBack={() => setView('home')} />}
      {view === 'brand-dashboard' && user && <BrandDashboard onBack={() => setView('home')} />}
      {view === 'academy' && <AcademyView onBack={() => setView('home')} />}
      {view === 'admin-login' && <AdminLogin onBack={() => setView('home')} onSuccess={() => setView('admin-dashboard')} />}
      {view === 'admin-dashboard' && <AdminDashboard onLogout={() => setView('home')} />}
      
      {view === 'home' && (
        <div className={`min-h-screen transition-all duration-700 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Navbar 
            onAuthClick={() => setView('auth')} 
            onThemeToggle={toggleTheme} 
            currentTheme={theme} 
            onDashboardClick={() => {
               if (user) {
                  if (ADMIN_EMAILS.includes(user.email || '')) setView('admin-dashboard');
                  else setView('dashboard');
               } else {
                  setView('auth');
               }
            }} 
          />
          <main>
            <Hero onAuthClick={() => setView('auth')} onDashboardClick={() => setView('dashboard')} />
            <Trust />
            <About onAcademyClick={() => setView('academy')} />
            <UVP />
            <BrandDNA />
            <ExpertiseSection />
            <GamifiedJourney />
            <CreatorVerse onEnterUniverse={() => setView('dashboard')} />
            <Engagement />
            <Pricing />
            <CTA />
          </main>
          <Footer onAdminClick={() => setView('admin-login')} />
          <ScrollToTop />
        </div>
      )}
    </Suspense>
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
