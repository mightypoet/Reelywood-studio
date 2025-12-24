
import React from 'react';
import { Shield, Target, Heart, Zap } from 'lucide-react';

export const UVP: React.FC = () => {
  const reel = [
    {
      letter: "R",
      title: "Resourceful Assets",
      desc: "Optimized content and tools that maximize impact with lean execution.",
      icon: <Zap className="text-amber-500" />
    },
    {
      letter: "E",
      title: "Effective Marketing",
      desc: "Data-driven strategies that focus on ROAS and measurable conversion.",
      icon: <Target className="text-indigo-500" />
    },
    {
      letter: "E",
      title: "Empathetic about Customers",
      desc: "Understanding the 'why' behind the click to build lasting loyalty.",
      icon: <Heart className="text-rose-500" />
    },
    {
      letter: "L",
      title: "Limitless Passion",
      desc: "Unwavering commitment to pushing brand boundaries and innovation.",
      icon: <Shield className="text-emerald-500" />
    }
  ];

  return (
    <section className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">Our Framework</h4>
          <h2 className="text-5xl font-black text-slate-900 leading-tight">The REEL Standard</h2>
          <p className="text-slate-500 text-lg italic">The core DNA of every Reelywood project.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reel.map((item, index) => (
            <div key={index} className="relative group">
              <div className="absolute -top-10 -left-4 text-9xl font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.letter}
              </div>
              <div className="relative z-10 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
