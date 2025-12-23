
import React from 'react';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';

// Fixed: Define helper components at the top to ensure they are available for the Footer component
// and to avoid type inference issues when used before declaration.
interface SocialIconProps {
  icon: React.ReactNode;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon }) => (
  <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all">
    {icon}
  </a>
);

interface FooterLinkProps {
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ children }) => (
  <a href="#" className="hover:text-indigo-600 transition-colors">{children}</a>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="font-extrabold text-lg tracking-tight">REELYWOOD</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Leading the next generation of marketing for SMEs through AI-powered automation and creative excellence.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Instagram size={20} />} />
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
              <SocialIcon icon={<Github size={20} />} />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-widest">Solutions</h4>
            <ul className="space-y-4 text-slate-500">
              <li><FooterLink>AI Automation</FooterLink></li>
              <li><FooterLink>Performance Ads</FooterLink></li>
              <li><FooterLink>Web Apps</FooterLink></li>
              <li><FooterLink>Influencer Strategy</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-widest">Company</h4>
            <ul className="space-y-4 text-slate-500">
              <li><FooterLink>About Us</FooterLink></li>
              <li><FooterLink>Case Studies</FooterLink></li>
              <li><FooterLink>Careers</FooterLink></li>
              <li><FooterLink>Contact</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-widest">Stay Updated</h4>
            <p className="text-slate-500 mb-6">Join our newsletter for weekly AI marketing tips.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
              <button className="bg-indigo-600 text-white px-4 py-3 rounded-r-xl font-bold">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-400 text-sm">© 2024 Reelywood Studio. All rights reserved.</p>
          <div className="flex space-x-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
