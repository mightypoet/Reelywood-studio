
import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { UVP } from './components/UVP';
import { Services } from './components/Services';
import { Leaderboard } from './components/Leaderboard';
import { Testimonials } from './components/Testimonials';
import { Engagement } from './components/Engagement';
import { DorkyProject } from './components/DorkyProject';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AuthView } from './components/AuthView';
import { Trust } from './components/Trust';

const MainContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth'>('home');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAuthClick = () => {
    setView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'auth') {
    return <AuthView onBack={() => setView('home')} />;
  }

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar onAuthClick={handleAuthClick} />
      <main>
        <section id="home" className="scroll-mt-24">
          <Hero onAuthClick={handleAuthClick} />
        </section>
        
        <Trust />
        
        <section id="about" className="scroll-mt-24">
          <About />
        </section>

        <UVP />
        
        <section id="services" className="scroll-mt-24">
          <Services />
        </section>
        
        <section id="leaderboard" className="scroll-mt-24">
          <Leaderboard />
        </section>
        
        <section id="testimonials" className="scroll-mt-24">
          <Testimonials />
        </section>
        
        <Engagement />
        
        <section id="explore" className="scroll-mt-24">
          <DorkyProject />
        </section>
        
        <section id="contact" className="scroll-mt-24">
          <CTA />
        </section>
      </main>
      <Footer />
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
