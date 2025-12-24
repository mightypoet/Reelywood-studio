
import React from 'react';
import { Bot, BarChart3, Globe, Megaphone, Users, Camera, Briefcase, ChevronRight, LucideIcon } from 'lucide-react';

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  light: string;
}

export const Services: React.FC = () => {
  const services: Service[] = [
    {
      title: "AI Automation Solutions",
      description: "Custom GPTs, automated outreach, and smart CRM integrations for your workflow.",
      icon: Bot,
      color: "bg-blue-500",
      light: "bg-blue-50"
    },
    {
      title: "SME Branding",
      description: "End-to-end identity design that resonates with your local and global audience.",
      icon: Briefcase,
      color: "bg-indigo-500",
      light: "bg-indigo-50"
    },
    {
      title: "Web Development",
      description: "Lightning fast, SEO-optimized React & Next.js applications that drive sales.",
      icon: Globe,
      color: "bg-cyan-500",
      light: "bg-cyan-50"
    },
    {
      title: "Content Creation",
      description: "Professional shoots and rapid AI-assisted video editing for TikTok, Reels, and YT.",
      icon: Camera,
      color: "bg-rose-500",
      light: "bg-rose-50"
    },
    {
      title: "Performance Marketing",
      description: "ROI-focused ad campaigns with deep funnel tracking and optimized spend.",
      icon: BarChart3,
      color: "bg-emerald-500",
      light: "bg-emerald-50"
    },
    {
      title: "Influencer Marketing",
      description: "Strategic partnerships with creators that actually move the needle for your brand.",
      icon: Users,
      color: "bg-violet-500",
      light: "bg-violet-50"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900">Complete Brand Ecosystem</h2>
            <p className="text-slate-600 text-lg">We don't just provide services; we build growth machines. Every tool we use is selected to maximize your specific brand potential.</p>
          </div>
          <button className="text-indigo-600 font-bold flex items-center space-x-2 group">
            <span>Explore All Services</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 group">
              <div className={`${s.light} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500`}>
                <s.icon size={28} className="text-slate-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{s.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                {s.description}
              </p>
              <div className="flex items-center text-indigo-600 font-bold text-sm cursor-pointer hover:underline">
                Learn more
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
