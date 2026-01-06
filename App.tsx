
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

  // Root level Auth and Sync Logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("🔥 Firebase User Detected:", user.email);

        // --- DIRECT SYNC LOGIC START ---
        try {
          if (!supabase) {
            console.error("❌ Supabase client not initialized.");
            return;
          }

          // 1. Check if user exists
          const { data: existingUser, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('firebase_uid', user.uid)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("❌ Error fetching profile:", fetchError);
          }

          // 2. If no user, create them
          if (!existingUser) {
            console.log("👤 User missing in Supabase. Creating now...");
            
            const { error: insertError } = await supabase
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

            if (insertError) {
              console.error("❌ INSERT FAILED:", insertError);
              alert("Database Error: " + insertError.message); // This will tell us WHY
            } else {
              console.log("✅ User successfully created in Supabase!");
            }
          } else {
            console.log("✅ User already exists in Supabase.");
          }
        } catch (err) {
          console.error("CRITICAL ERROR:", err);
        }
        // --- DIRECT SYNC LOGIC END ---

      } else {
        console.log("💤 User logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/admin' || path === '/admin/login' || hash === '#admin') {
        setView('admin-login');
      } else if (path === '/dashboard' || hash === '#dashboard') {
        setView('dashboard');
      } else if (path === '/creatorcard' || hash === '#creatorcard') {
        setView('creator-card');
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

  useEffect(() => {
    if (view === 'admin-login' && user?.email && ADMIN_EMAILS.includes(user.email)) {
      setView('admin-dashboard');
    }
  }, [user, view]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAuthClick = () => {
    setView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardClick = () => {
    if (!user) {
      setView('auth');
    } else {
      setView('dashboard');
      window.history.pushState({}, '', '/dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatorUniverseClick = () => {
    if (!user) {
      setView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('dashboard');
      window.history.pushState({}, '', '/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  if (view === 'creator-card') {
    return <CreatorCardView onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
  }

  if (view === 'dashboard') {
    if (!user) {
      return <AuthView onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
    }
    return <DashboardView onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />;
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
      <Navbar onAuthClick={handleAuthClick} onThemeToggle={toggleTheme} currentTheme={theme} onDashboardClick={handleDashboardClick} />
      <main>
        <section id="home" className="scroll-mt-24">
          <Hero onAuthClick={handleAuthClick} onDashboardClick={handleDashboardClick} />
        </section>
        
        <Trust />
        
        <section id="about" className="scroll-mt-24">
          <About onAcademyClick={handleAcademyClick} />
        </section>

        <UVP />

        <BrandDNA />
        
        <ExpertiseSection />
        
        <section id="leaderboard" className="scroll-mt-24">
          <Leaderboard />
        </section>

        <section id="creators" className="scroll-mt-24">
          <CreatorVerse onEnterUniverse={handleCreatorUniverseClick} />
        </section>
        
        <Engagement />
        
        <section id="explore" className="scroll-mt-24">
          <DorkyProject />
        </section>

        <section id="pricing" className="scroll-mt-24">
          <Pricing />
        </section>
        
        <section id="contact" className="scroll-mt-24">
          <CTA />
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
