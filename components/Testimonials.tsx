
import React from 'react';
import { Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    { name: "Arindam Sur", role: "F&B Entrepreneur", content: "Reelywood transformed our local presence into a digital brand that people actually search for." },
    { name: "Sanjib Saha", role: "D2C Founder", content: "The AI automation in our Meta ads saved us thousands in testing. ROAS is finally where it needs to be." },
    { name: "Muqtadir Rahaman", role: "Tech Lead", content: "Working with a marketing agency that actually understands tech stack integration is a breath of fresh air." },
    { name: "Shamim Rahaman", role: "Operations Director", content: "Zero-friction onboarding. We were up and running with their CPaaS tools in under 48 hours." },
    { name: "Sarina Gwan", role: "Brand Strategist", content: "The REEL framework isn't just a gimmick. It actually aligns our creative and performance goals." },
    { name: "Arkin Bhatt", role: "Financial Advisor", content: "Professional, data-driven, and most importantly, they care about the value they provide." }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">Success Stories</h4>
          <h2 className="text-5xl font-black text-slate-900 leading-tight">Trusted Voices</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative group hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500">
              <Quote className="text-indigo-100 absolute top-8 right-8 group-hover:text-indigo-200 transition-colors" size={48} fill="currentColor" />
              <div className="relative z-10 space-y-6">
                <p className="text-slate-600 leading-relaxed font-medium italic">"{r.content}"</p>
                <div className="pt-6 border-t border-slate-200">
                  <p className="text-slate-900 font-black text-sm uppercase tracking-widest">{r.name}</p>
                  <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
