
import React from 'react';

export const Trust: React.FC = () => {
  const logos = [
    "https://picsum.photos/seed/logo1/200/80",
    "https://picsum.photos/seed/logo2/200/80",
    "https://picsum.photos/seed/logo3/200/80",
    "https://picsum.photos/seed/logo4/200/80",
    "https://picsum.photos/seed/logo5/200/80",
    "https://picsum.photos/seed/logo6/200/80",
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-slate-400 font-semibold uppercase tracking-widest text-sm mb-12">Trusted by 200+ forward-thinking SMEs</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all">
            {logos.map((logo, i) => (
              <img key={i} src={logo} alt="Partner" className="h-10 w-auto object-contain" />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-20">
          {[
            { metric: "15M+", label: "Ad Impressions Generated", desc: "For our performance marketing clients in 2024." },
            { metric: "450%", label: "Average Engagement Lift", desc: "Seen by brands using our AI content workflow." },
            { metric: "24/7", label: "Automated Lead Gen", desc: "Our AI systems never sleep, capturing leads round the clock." }
          ].map((stat, i) => (
            <div key={i} className="text-center p-10 bg-indigo-50/30 rounded-[3rem] border border-indigo-50">
              <p className="text-5xl font-black text-indigo-600 mb-2">{stat.metric}</p>
              <p className="text-lg font-bold text-slate-900 mb-2">{stat.label}</p>
              <p className="text-slate-500">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
