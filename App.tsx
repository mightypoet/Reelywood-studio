
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

// Lazy load large dashboard components
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          if (!supabase) return;
          
          if (ADMIN_EMAILS.includes(user.email || '')) {
             setView('admin-dashboard');
          } else {
            const { data: brandMatch } = await supabase
              .from('partner_brands')
              .select('id')
              .eq('brand_email', user.email)
              .maybeSingle();
            
            if (brandMatch) {
              setView('brand-dashboard');
            } else {
              setView('dashboard');
            }
          }

          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('firebase_uid', user.uid)
            .single();

          if (!existingUser) {
            // Initializing new profile node with full dataset
            await supabase
              .from('profiles')
              .insert([{
                firebase_uid: user.uid,
                email: user.email || "no-email",
                role: 'user',
                card_status: 'none',
                reelcoins: 0,
                display_name: user.displayName || 'Agent ' + user.uid.substring(0, 5),
                photo_url: user.photoURL || null,
                handle: user.displayName?.toLowerCase().replace(/\s/g, '') || '',
                niche: 'CREATOR NODE',
                followers: 0,
                bio: ''
              }]);
          }
        } catch (err) {
          console.error("CRITICAL ERROR:", err);
        }
      } else {
        setView('home');
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
      else if (path === '/brands' || hash === '#brands') setView('brand-dashboard');
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
