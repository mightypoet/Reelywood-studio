
import React from 'react';
import { Check, ArrowRight, Zap, Star, Crown } from 'lucide-react';

export const Pricing: React.FC = () => {
  const tiers = [
    {
      name: "Starter",
      price: "₹15,000",
      period: "/ month",
      desc: "First transmission into digital space.",
      icon: <Zap className="text-black" />,
      color: "bg-white dark:bg-white/90",
      features: [
        "1 Social Media Manager",
        "Google SEO Visibility",
        "Product Management"
      ],
      buttonText: "Initiate Sync",
      highlight: false
    },
    {
      name: "Professional",
      price: "₹45,000",
      period: "/ month",
      desc: "Empower your brand ecosystem.",
      icon: <Star className="text-black" />,
      color: "bg-[#ffde59]",
      features: [
        "1 Content Strategist",
        "Full Asset Production",
        "Web/App Development",
        "Influencer Marketing"
      ],
      buttonText: "Maximize Reach",
      highlight: true
    },
    {
      name: "Elite",
      price: "Custom",
      period: "",
      desc: "Full dedicated performance node.",
      icon: <Crown className="text-black" />,
      color: "bg-[#834bf1]",
      features: [
        "1 Meta Ads Manager",
        "Creative Ads Engine",
        "Sales Campaigns",
        "Custom Business Node",
        "All Tier Services"
      ],
      buttonText: "Custom Logic",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden scroll-mt-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-20 space-y-6">
          <h4 className="text-[#834bf1] dark:text-[#ffde59] font-black text-sm uppercase tracking-[0.4em]">Resource Allocation</h4>
          <h2 className="text-6xl font-black text-black dark:text-white leading-tight tracking-tighter font-display uppercase">Investment Tiers</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-bold">Scaling with surgical precision.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`
                relative p-10 border-4 border-black dark:border-white transition-all duration-300 flex flex-col h-full
                ${tier.color} ${tier.highlight ? 'shadow-[12px_12px_0px_0px_#000000] dark:shadow-[12px_12px_0px_0px_#ffffff] -translate-y-2' : 'shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-[12px_12px_0px_0px_#000000] dark:hover:shadow-[12px_12px_0px_0px_#ffffff] hover:-translate-y-1'}
              `}
            >
              {tier.highlight && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 border-2 border-white dark:border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#834bf1]">
                  High Growth
                </div>
              )}

              <div className="mb-8">
                 <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mb-6">
                   {tier.icon}
                 </div>
                 <h3 className="text-4xl font-black text-black mb-2 font-display uppercase">{tier.name}</h3>
                 <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-black tracking-tighter">{tier.price}</span>
                  <span className="text-black/60 font-black text-xs uppercase tracking-widest">{tier.period}</span>
                </div>
              </div>

              <p className="text-black font-bold text-sm mb-10 min-h-[48px]">
                {tier.desc}
              </p>
              
              <ul className="space-y-6 mb-12 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3 text-black">
                    <div className="w-3 h-3 border-2 border-black bg-white rounded-sm rotate-45"></div>
                    <span className="text-sm font-black uppercase tracking-wide">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`
                  w-full py-6 border-4 border-black font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3
                  ${tier.name === 'Professional' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}
                  shadow-[4px_4px_0px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1
                `}
              >
                <span>{tier.buttonText}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
