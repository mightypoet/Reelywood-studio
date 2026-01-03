
import React from 'react';
import { Mail, Phone, Globe, Instagram, Twitter, Linkedin, Lock } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const LOGO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%281%29.mp4";

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
    <footer className="bg-white dark:bg-[#0a0a0a] pt-32 pb-16 border-t-4 border-black dark:border-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
          <div className="space-y-10 max-w-sm">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => scrollToId(e as any, 'home')}>
              <div className="w-12 h-12 border-2 border-black dark:border-white overflow-hidden bg-black/5">
                <video 
                  src={LOGO_URL} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-black text-3xl tracking-tighter uppercase text-black dark:text-white font-display">REELYWOOD</span>
            </div>
            <p className="text-black dark:text-white/80 text-sm leading-relaxed font-bold">
              Engineering growth ecosystems through Human-AI synergy. The standard for modern brands.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-12 h-12 bg-white dark:bg-[#111] border-4 border-black dark:border-white flex items-center justify-center text-black dark:text-white hover:bg-[#ffde59] dark:hover:bg-[#ffde59] dark:hover:text-black transition-all shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 bg-white dark:bg-[#111] border-4 border-black dark:border-white flex items-center justify-center text-black dark:text-white hover:bg-[#834bf1] dark:hover:bg-[#834bf1] hover:text-white transition-all shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-24">
            <div>
              <h4 className="font-black text-black mb-8 text-xs uppercase tracking-widest bg-[#ffde59] inline-block px-2 border border-black dark:border-white">Solutions</h4>
              <ul className="space-y-4 text-black dark:text-white text-sm font-bold uppercase tracking-wide">
                <li><a href="#pricing" onClick={(e) => scrollToId(e, 'pricing')} className="hover:text-[#834bf1] dark:hover:text-[#ffde59]">Starter</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToId(e, 'pricing')} className="hover:text-[#834bf1] dark:hover:text-[#ffde59]">Pro</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToId(e, 'pricing')} className="hover:text-[#834bf1] dark:hover:text-[#ffde59]">Elite</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-black dark:text-white mb-8 text-xs uppercase tracking-widest bg-[#834bf1] text-white inline-block px-2 border border-black dark:border-white">Labs</h4>
              <ul className="space-y-4 text-black dark:text-white text-sm font-bold uppercase tracking-wide">
                <li><div className="flex items-center space-x-2"><span className="opacity-40">Dorky.ai</span><span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded font-black">BETA</span></div></li>
                <li><button onClick={onAdminClick} className="hover:text-[#834bf1] dark:hover:text-[#ffde59] flex items-center space-x-2">
                  <Lock size={12} />
                  <span>Terminal</span>
                </button></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-black text-black dark:text-white mb-8 text-xs uppercase tracking-widest bg-black dark:bg-white dark:text-black text-white inline-block px-2 border border-black dark:border-white">Contact</h4>
              <ul className="space-y-4 text-black dark:text-white text-sm font-bold">
                <li className="flex items-center space-x-2">
                  <Mail size={14} />
                  <span>reelywood@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2 text-[#834bf1] dark:text-[#ffde59]">
                  <Phone size={14} />
                  <span>+91 9123961368</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t-4 border-black dark:border-white flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white">
          <div className="flex items-center space-x-8">
             <p>© 2024 Reelywood Studio.</p>
             <p className="opacity-40">Privacy Protocol</p>
          </div>
          <p className="bg-black dark:bg-white text-white dark:text-black px-4 py-2">Mission Critical Execution</p>
        </div>
      </div>
    </footer>
  );
};
