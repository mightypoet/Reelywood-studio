
import React from 'react';
import { ChevronRight, Zap, ShieldCheck, Palette, Mail } from 'lucide-react';

export const Services: React.FC = () => {
  const sections = [
    {
      title: "Business Assist",
      icon: <Zap className="text-amber-500" />,
      items: [
        "Sales-oriented Meta Ads funnel build-out",
        "Competitor research",
        "Lead generation & ads running",
        "AI-powered bidding optimization",
        "Automated lead qualification",
        "Product listing",
        "End-to-end company registration"
      ]
    },
    {
      title: "Foundations",
      icon: <ShieldCheck className="text-indigo-600" />,
      items: [
        "Social media & business listings",
        "Google Business Manager",
        "Reviews management",
        "Dedicated social media manager",
        "Ongoing analytics review"
      ]
    },
    {
      title: "Growth & Branding",
      icon: <Palette className="text-rose-500" />,
      items: [
        "Brand design",
        "Content strategy & shoots",
        "Creative direction",
        "Website & app creation",
        "Influencer shortlisting",
        "Budget-friendly influencer campaigns",
        "Pan-India influencer marketing strategy"
      ]
    },
    {
      title: "Communication (CPaaS)",
      icon: <Mail className="text-emerald-500" />,
      highlight: "3x faster than traditional agencies",
      items: [
        "99% OTP delivery rate",
        "Global Email/SMS/RCS reach",
        "WhatsApp API integration",
        "Zero-friction onboarding",
        "Free testing & No integration cost"
      ]
    }
  ];

  return (
    <section id="services" className="py-24 bg-slate-50 overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16 space-y-4">
          <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">How It Works</h4>
          <h2 className="text-5xl font-black text-slate-900 leading-tight">Complete Brand Ecosystem</h2>
          <p className="text-lg text-slate-500 italic">We don't just provide services; we build growth machines.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-8">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   {section.icon}
                 </div>
                 {section.highlight && (
                   <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                     {section.highlight}
                   </span>
                 )}
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 mb-6">{section.title}</h3>
              
              <ul className="space-y-4 mb-10">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 text-slate-600">
                    <ChevronRight size={16} className="text-indigo-400 mt-1 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">
                <span>Configure Package</span>
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
