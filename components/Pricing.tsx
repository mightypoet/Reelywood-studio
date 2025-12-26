import React from 'react';
import { Check, ArrowRight, Zap, Star, Crown } from 'lucide-react';

export const Pricing: React.FC = () => {
  const tiers = [
    {
      name: "Starter",
      price: "₹15,000",
      period: "/ month",
      desc: "Your first step towards your digital presence.",
      icon: <Zap className="text-amber-500" />,
      features: [
        "1 Social Media Manager",
        "Google SEO & Search Visibility",
        "Product Management & Listings"
      ],
      buttonText: "Book a Consultation",
      highlight: false
    },
    {
      name: "Professional",
      price: "₹45,000",
      period: "/ month",
      desc: "Your brand’s leap towards digital growth & empowerment.",
      icon: <Star className="text-indigo-600" />,
      features: [
        "1 Brand Content Strategist",
        "Brand Asset Production",
        "1 Website & App Developer",
        "Influencer Marketing"
      ],
      buttonText: "Book a Consultation",
      highlight: true
    },
    {
      name: "Elite",
      price: "Custom",
      period: "",
      desc: "A customizable, dedicated team to push reach and sales for your brand.",
      icon: <Crown className="text-emerald-500" />,
      features: [
        "1 Meta Ads Manager",
        "Creative Ads Production",
        "Sales-oriented Campaign Execution",
        "Any Business Requirements",
        "Includes all-tier services"
      ],
      buttonText: "Book a Consultation",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden scroll-mt-24">
      {/* Subtle Animated Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white animate-gradient-slow pointer-events-none"></div>
      
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16 space-y-4">
          <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">Pricing Plans</h4>
          <h2 className="text-5xl font-black text-slate-900 leading-tight">Investment for Growth</h2>
          <p className="text-lg text-slate-500 italic">A customizable, dedicated team to push reach and sales for your brand.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`
                relative bg-white/80 backdrop-blur-sm p-10 rounded-[3rem] border transition-all duration-500 group flex flex-col
                ${tier.highlight 
                  ? 'border-indigo-200 shadow-2xl shadow-indigo-100/50 scale-105 z-20' 
                  : 'border-white shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 z-10'}
              `}
            >
              {tier.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="flex justify-between items-start mb-8">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   {tier.icon}
                 </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">{tier.period}</span>
                </div>
              </div>

              <p className="text-slate-500 text-sm font-medium mb-8 min-h-[40px]">
                {tier.desc}
              </p>
              
              <ul className="space-y-4 mb-10 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3 text-slate-600">
                    <div className="mt-1 bg-indigo-50 rounded-full p-0.5">
                      <Check size={14} className="text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`
                  w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2
                  ${tier.highlight 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'}
                `}
              >
                <span>{tier.buttonText}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
      `}</style>
    </section>
  );
};