import React, { useState, useEffect, useRef } from 'react';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  { 
    name: "Arindam Sur", 
    role: "F&B Entrepreneur", 
    content: "Reelywood transformed our local presence into a digital brand that people actually search for. Their AI tools are a game changer.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arindam",
    rating: 5
  },
  { 
    name: "Sanjib Saha", 
    role: "D2C Founder", 
    content: "The AI automation in our Meta ads saved us thousands in testing. ROAS is finally where it needs to be. Highly recommend!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjib",
    rating: 5
  },
  { 
    name: "Muqtadir Rahaman", 
    role: "Tech Lead", 
    content: "Working with a marketing agency that actually understands tech stack integration is a breath of fresh air. Seamless delivery.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Muqtadir",
    rating: 5
  },
  { 
    name: "Shamim Rahaman", 
    role: "Operations Director", 
    content: "Zero-friction onboarding. We were up and running with their CPaaS tools in under 48 hours. The speed is unmatched.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shamim",
    rating: 4
  },
  { 
    name: "Sarina Gwan", 
    role: "Brand Strategist", 
    content: "The REEL framework isn't just a gimmick. It actually aligns our creative and performance goals perfectly. Exceptional strategy.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarina",
    rating: 5
  },
  { 
    name: "Arkin Bhatt", 
    role: "Financial Advisor", 
    content: "Professional, data-driven, and most importantly, they care about the value they provide. Their brand audit was eye-opening.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arkin",
    rating: 5
  }
];

export const Testimonials: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // We double the testimonials for seamless infinite scroll
  const displayTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-32 bg-slate-50 overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
          <Star size={14} className="fill-indigo-600" />
          <span>Success Stories</span>
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
          Trusted by Industry <span className="text-indigo-600">Visionaries</span>
        </h2>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          Hear from the entrepreneurs and leaders who have scaled their brand ecosystems with Reelywood.
        </p>
      </div>

      {/* Infinite Scrolling Track */}
      <div 
        className="relative flex overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`flex space-x-8 animate-scroll ${isPaused ? 'pause' : ''}`}
          ref={scrollRef}
        >
          {displayTestimonials.map((t, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-[400px] bg-white p-10 rounded-[3rem] border border-slate-100 relative group/card hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500"
            >
              {/* Quote Icon with Glow */}
              <div className="absolute top-8 right-8 text-indigo-100 group-hover/card:text-indigo-200 transition-colors duration-500">
                <Quote size={48} fill="currentColor" />
              </div>

              <div className="relative z-10 space-y-8 h-full flex flex-col justify-between">
                {/* Rating Stars */}
                <div className="flex space-x-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <p className="text-slate-600 text-lg leading-relaxed font-medium italic">
                  "{t.content}"
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-5 pt-8 border-t border-slate-100">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 border-2 border-white shadow-md group-hover/card:scale-110 transition-transform duration-500">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black text-sm uppercase tracking-widest">{t.name}</p>
                    <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Fades */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-400px * ${testimonials.length} - 2rem * ${testimonials.length})); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
