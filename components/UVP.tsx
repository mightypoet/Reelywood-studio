
import React from 'react';
import { Carousel, Card, CardData } from './AppleCardsCarousel';
import { Sparkles, Zap, Target, Bot, BarChart3, Fingerprint } from 'lucide-react';

const DummyContent = ({ title, body, image, icon: Icon }: { title: string; body: string; image: string; icon: any }) => {
  return (
    <div className="space-y-12">
      <div className="bg-white dark:bg-[#111] border-[6px] border-black dark:border-white p-10 md:p-16 shadow-[16px_16px_0px_0px_#834bf1] dark:shadow-[16px_16px_0px_0px_#ffde59] group">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-24 h-24 shrink-0 bg-black text-white border-[4px] border-white flex items-center justify-center shadow-[6px_6px_0px_0px_#ffde59] transition-transform group-hover:rotate-6">
            <Icon size={40} />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl md:text-5xl font-black text-black dark:text-white italic uppercase font-display leading-[0.9] tracking-tighter">
              {title}
            </h3>
            <p className="text-black dark:text-white/80 text-lg md:text-2xl font-bold leading-relaxed uppercase italic border-l-[8px] border-[#ffde59] pl-8">
              {body}
            </p>
          </div>
        </div>
        <div className="relative mt-16 group">
          <div className="absolute inset-0 bg-[#834bf1] translate-x-4 translate-y-4 border-[4px] border-black -z-10"></div>
          <img
            src={image}
            alt="Operational Protocol"
            className="w-full h-auto object-cover border-[6px] border-black dark:border-white grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute bottom-6 right-6 bg-black text-white px-6 py-2 border-[2px] border-white font-black text-[10px] uppercase tracking-widest italic shadow-[4px_4px_0px_0px_#834bf1]">
            PROTOCOL_SYNC_V4.1
          </div>
        </div>
      </div>
    </div>
  );
};

export const UVP: React.FC = () => {
  const reelData: CardData[] = [
    {
      category: "Intelligence",
      title: "Resourceful Assets",
      src: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/5.png",
      content: (
        <DummyContent 
          icon={Bot}
          title="Autonomous Asset Architecture."
          body="We build 24/7 digital conversion engines. Our high-fidelity landing pages and custom AI agents reduce operational friction while maximizing market discovery."
          image="https://izz9qoicna213xwc.public.blob.vercel-storage.com/5.png"
        />
      ),
    },
    {
      category: "Performance",
      title: "Surgical Marketing",
      src: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/6.png",
      content: (
        <DummyContent 
          icon={BarChart3}
          title="Data-Driven Scalability Protocols."
          body="Marketing is a game of precision. We leverage advanced attribution models and behavioral intelligence to ensure your media spend yields measurable dominance."
          image="https://izz9qoicna213xwc.public.blob.vercel-storage.com/6.png"
        />
      ),
    },
    {
      category: "Connection",
      title: "Empathic Logic",
      src: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/7.png",
      content: (
        <DummyContent 
          icon={Fingerprint}
          title="The Human Variable in the Machine."
          body="In a synthetic landscape, empathy is the elite edge. We map consumer psychology to narratives that spark genuine authority and long-term brand loyalty."
          image="https://izz9qoicna213xwc.public.blob.vercel-storage.com/7.png"
        />
      ),
    },
    {
      category: "Evolution",
      title: "Infinite Velocity",
      src: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/8.png",
      content: (
        <DummyContent 
          icon={Zap}
          title="Accelerated Brand Trajectories."
          body="We don't iterate; we leap. Our laboratory environment allows for constant testing of the latest visual tech to keep your identity at the bleeding edge of culture."
          image="https://izz9qoicna213xwc.public.blob.vercel-storage.com/8.png"
        />
      ),
    },
  ];

  const cards = reelData.map((card, index) => (
    <Card key={card.title + index} card={card} index={index} />
  ));

  return (
    <section className="py-48 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="text-left space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#ffde59]">
            <Target size={14} className="text-[#ffde59]" />
            <span>Operational DNA</span>
          </div>
          <h2 className="text-7xl md:text-9xl font-black text-black dark:text-white leading-[0.8] tracking-tighter font-display uppercase italic">
            The <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">REEL</span> <br /> Standard
          </h2>
          <div className="flex items-center space-x-6">
             <div className="h-[12px] w-64 bg-[#ffde59] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(131,75,241,1)]"></div>
             <span className="text-[11px] font-black uppercase tracking-[0.6em] text-black/20 dark:text-white/20">Mission Protocols</span>
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <Carousel items={cards} />
      </div>
    </section>
  );
};
