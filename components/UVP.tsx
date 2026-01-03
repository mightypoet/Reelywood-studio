
import React from 'react';
import { Carousel, Card, CardData } from './AppleCardsCarousel';

const DummyContent = ({ title, body, image }: { title: string; body: string; image: string }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-8 md:p-14 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff]">
        <p className="text-black dark:text-white text-base md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
          <span className="font-black bg-[#ffde59] text-black px-2 border border-black">
            {title}
          </span>{" "}
          {body}
        </p>
        <img
          src={image}
          alt="Framework detail"
          className="md:w-3/4 h-auto mt-10 mx-auto object-cover border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff]"
        />
      </div>
    </div>
  );
};

export const UVP: React.FC = () => {
  const reelData: CardData[] = [
    {
      category: "Intelligence",
      title: "Resourceful Assets",
      src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop",
      content: (
        <DummyContent 
          title="Optimized Impact through Innovation."
          body="We develop digital assets that work 24/7. From custom AI wrappers to high-conversion landing pages, our focus is on building tools that reduce operational drag while maximizing market capture."
          image="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop"
        />
      ),
    },
    {
      category: "Performance",
      title: "Effective Marketing",
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
      content: (
        <DummyContent 
          title="Data-Driven Scalability."
          body="Marketing isn't a guessing game. Our performance stack leverages advanced attribution and behavioral analytics to ensure every rupee spent on Meta, Google, or TikTok results in measurable growth."
          image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop"
        />
      ),
    },
    {
      category: "Connection",
      title: "Empathetic Approach",
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop",
      content: (
        <DummyContent 
          title="Understanding the Human behind the Click."
          body="In an AI world, empathy is the ultimate competitive advantage. We dive into customer psychology to create narratives that resonate on a personal level, fostering long-term brand loyalty."
          image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop"
        />
      ),
    },
    {
      category: "Vision",
      title: "Limitless Passion",
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000&auto=format&fit=crop",
      content: (
        <DummyContent 
          title="Obsessed with Brand Evolution."
          body="We don't settle for 'good enough'. Our team is constantly experimenting with the latest in tech and creative direction to keep your brand at the absolute forefront of your industry."
          image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop"
        />
      ),
    },
    {
      category: "SME Focus",
      title: "Tailored Growth",
      src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop",
      content: (
        <DummyContent 
          title="Big Agency Results, Lean Pricing."
          body="Specifically designed for SMEs, our packages provide the technical and creative horsepower of a multinational agency at a fraction of the overhead. Your success is our primary KPI."
          image="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2000&auto=format&fit=crop"
        />
      ),
    },
  ];

  const cards = reelData.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section className="py-48 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="text-left space-y-8">
          <h4 className="text-[#834bf1] dark:text-[#ffde59] font-black text-base uppercase tracking-[0.5em]">Protocol Framework</h4>
          <h2 className="text-6xl md:text-7xl font-black text-black dark:text-white leading-tight tracking-tighter font-display uppercase">The REEL Standard</h2>
          <div className="h-3 w-48 bg-[#ffde59] border-[3px] border-black dark:border-white"></div>
        </div>
      </div>
      
      <div className="w-full">
        <Carousel items={cards} />
      </div>
    </section>
  );
};
