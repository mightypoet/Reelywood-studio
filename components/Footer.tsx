
import React from 'react';
import { Mail, Phone, Globe, Instagram, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToId = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
          <div className="space-y-10 max-w-sm">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => scrollToId(e as any, 'home')}>
              <div className="w-10 h-10 bg-[#1A73E8] rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase text-[#202124]">REELYWOODSTUDIO</span>
            </div>
            <p className="text-[#5F6368] text-sm leading-relaxed font-medium">
              A lean, dynamic marketing powerhouse built on the synergy of Human expertise and AI precision. We build growth machines for modern brands.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#5F6368] hover:bg-[#1A73E8] hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#5F6368] hover:bg-[#1A73E8] hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-24">
            <div>
              <h4 className="font-bold text-[#202124] mb-8 text-xs uppercase tracking-widest">Solutions</h4>
              <ul className="space-y-4 text-[#5F6368] text-sm font-medium">
                <li><a href="#services" onClick={(e) => scrollToId(e, 'services')} className="hover:text-[#1A73E8]">Business Assist</a></li>
                <li><a href="#services" onClick={(e) => scrollToId(e, 'services')} className="hover:text-[#1A73E8]">Foundations</a></li>
                <li><a href="#services" onClick={(e) => scrollToId(e, 'services')} className="hover:text-[#1A73E8]">Growth & Branding</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#202124] mb-8 text-xs uppercase tracking-widest">Labs</h4>
              <ul className="space-y-4 text-[#5F6368] text-sm font-medium">
                <li>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Dorky.ai</span>
                    <span className="text-[8px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase">Soon</span>
                  </div>
                </li>
                <li><a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="hover:text-[#1A73E8]">Pricing</a></li>
                <li><a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="hover:text-[#1A73E8]">Brand Audit</a></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-[#202124] mb-8 text-xs uppercase tracking-widest">Connection</h4>
              <ul className="space-y-4 text-[#5F6368] text-sm font-medium">
                <li className="flex items-center space-x-2">
                  <Mail size={14} className="text-[#1A73E8]" />
                  <span>reelywood@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone size={14} className="text-[#1A73E8]" />
                  <span>+91 9123961368</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-[#E0E0E0] flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-[11px] font-bold uppercase tracking-widest text-[#5F6368]">
          <div className="flex items-center space-x-6">
             <p>© 2024 Reelywood Studio.</p>
             <p>Privacy Protocol</p>
          </div>
          <p className="text-[#1A73E8] tracking-[0.4em]">Designed for high-impact growth.</p>
        </div>
      </div>
    </footer>
  );
};
