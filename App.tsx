
import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DorkyProject } from './components/DorkyProject';
import { UVP } from './components/UVP';
import { Services } from './components/Services';
import { Trust } from './components/Trust';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';

const App: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar />
      <main>
        <section id="home">
          <Hero />
        </section>
        <section id="dorky">
          <DorkyProject />
        </section>
        <section id="about">
          <UVP />
        </section>
        <section id="services">
          <Services />
        </section>
        <section id="clients">
          <Trust />
        </section>
        <section id="contact">
          <CTA />
        </section>
      </main>
      <Footer />
      
      {/* Interactive AI Floating Assistant - Demonstrating AI Expertise */}
      <div className="fixed bottom-8 right-8 z-50">
        <AIAssistant />
      </div>
    </div>
  );
};

export default App;
