
import React from 'react';
// Import CardData to ensure reelData items match the expected type for the Card component
import { Carousel, Card, CardData } from './AppleCardsCarousel';

const DummyContent = ({ title, body, image }: { title: string; body: string; image: string }) => {
  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-[3rem]">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto leading-relaxed">
          <span className="font-black text-neutral-900 dark:text-neutral-200">
            {title}
          </span>{" "}
          {body}
        </p>
        <img
          src={image}
          alt="Framework detail"
          className="md:w-3/4 h-auto mt-10 mx-auto object-cover rounded-3xl shadow-2xl"
        />
      </div>
    </div>
  );
};

export const UVP: React.FC = () => {
  // Explicitly typing reelData as CardData[] ensures compatibility with the Card component props
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
    <section className="py-24 bg-white overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="text-left space-y-4">
          <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">Our Framework</h4>
          <h2 className="text-5xl font-black text-slate-900 leading-tight">The REEL Standard</h2>
          <p className="text-slate-500 text-lg italic font-medium">Click on a pillar to explore our methodology.</p>
        </div>
      </div>
      
      <div className="w-full">
        <Carousel items={cards} />
      </div>
    </section>
  );
};
