
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
const SchoolView = lazy(() => import('./components/School/SchoolView').then(m => ({ default: m.SchoolView })));
const AdminLogin = lazy(() => import('./components/Admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AuthView = lazy(() => import('./components/AuthView').then(m => ({ default: m.AuthView })));
const CreatorCardView = lazy(() => import('./components/CreatorCardView').then(m => ({ default: m.CreatorCardView })));

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

const LoadingFallback = () => (
  <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center space-y-8 transition-colors duration-300">
    <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
    <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black dark:text-white animate-pulse">Syncing Interface...</p>
  </div>
);

const MainContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth' | 'creator-card' | 'admin-login' | 'admin-dashboard' | 'brand-dashboard' | 'academy' | 'dashboard' | 'school'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin' || hash === '#admin') return 'admin-login';
    if (path === '/brands' || hash === '#brands') return 'brand-dashboard';
    if (path === '/dashboard' || hash === '#dashboard') return 'dashboard';
    if (path === '/creatorcard' || hash === '#creatorcard') return 'creator-card';
    if (path === '/academy' || hash === '#academy') return 'academy';
    if (path === '/reelywoodschool' || hash === '#school') return 'school';
    return 'home';
  });
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
          if (!supabase) {
            setView('dashboard'); // Fallback even if supabase fails
            return;
          }
          
          // 1. Determine View
          if (ADMIN_EMAILS.includes(firebaseUser.email || '')) {
             setView('admin-dashboard');
          } else {
            const { data: brandMatch } = await supabase
              .from('partner_brands')
              .select('id')
              .eq('brand_email', firebaseUser.email)
              .maybeSingle();
            
            setView(brandMatch ? 'brand-dashboard' : 'dashboard');
          }

          // 2. Atomic Profile Sync (Upsert prevents crashes if record partially exists)
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
              ignoreDuplicates: true // Only insert if missing to preserve existing bio/reelcoins
            });

        } catch (err) {
          console.error("BOOTSTRAP_ERROR:", err);
          setView('home');
        }
      } else {
        // Only reset to home if we aren't already on a public sub-page
        const path = window.location.hash || window.location.pathname;
        if (!['#academy', '#creatorcard', '#admin'].includes(path)) {
          setView('home');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') setView('admin-login');
      else if (path === '/brands' || hash === '#brands') setView('brand-dashboard');
      else if (path === '/dashboard' || hash === '#dashboard') setView('dashboard');
      else if (path === '/creatorcard' || hash === '#creatorcard') setView('creator-card');
      else if (path === '/academy' || hash === '#academy') setView('academy');
      else if (path === '/reelywoodschool' || hash === '#school') setView('school');
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
      {view === 'school' && <SchoolView onBack={() => setView('home')} />}
      
      {view === 'home' && (
        <div className="min-h-screen transition-all duration-700 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
          <Navbar 
            onAuthClick={() => setView('auth')} 
            onThemeToggle={toggleTheme} 
            currentTheme={theme} 
            onSchoolClick={() => setView('school')}
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
