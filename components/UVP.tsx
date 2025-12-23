
import React from 'react';
import { Target, Cpu, Layout, Video } from 'lucide-react';

export const UVP: React.FC = () => {
  const values = [
    {
      icon: <Cpu className="text-indigo-600" />,
      title: "AI Integration",
      description: "We deploy custom AI tools that automate lead gen and content distribution."
    },
    {
      icon: <Target className="text-violet-600" />,
      title: "Data-Driven Strategy",
      description: "Precise audience targeting based on real-time market performance data."
    },
    {
      icon: <Layout className="text-blue-600" />,
      title: "Modern Presence",
      description: "High-converting web experiences built for the modern digital landscape."
    },
    {
      icon: <Video className="text-rose-600" />,
      title: "Content Mastery",
      description: "Cinematic production tailored for social algorithms and viral potential."
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-sm">Why Reelywood?</h2>
          <p className="text-4xl font-extrabold text-slate-900 leading-tight">We combine human creativity with AI efficiency</p>
          <p className="text-slate-600 text-lg">Our framework is designed to remove the guesswork from your marketing efforts.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((item, index) => (
            <div key={index} className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
