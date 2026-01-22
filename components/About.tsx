
import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/clients';

export interface CreatorFormData {
  fullName: string;
  platform: string;
  niche: string;
  city: string;
  email: string;
  phone: string;
  handle: string;
  followers: string;
}

const initialFormState: CreatorFormData = {
  fullName: '',
  platform: '',
  niche: '',
  city: '',
  email: '',
  phone: '',
  handle: '',
  followers: ''
};

interface AboutProps {
  onAcademyClick?: () => void;
}

export const About: React.FC<AboutProps> = ({ onAcademyClick }) => {
  const [formData, setFormData] = useState<CreatorFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(842);

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitlistCount(prev => prev + Math.floor(Math.random() * 3));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleFormUpdate = (data: Partial<CreatorFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (data: CreatorFormData) => {
    if (auth.currentUser && supabase) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            card_status: 'pending',
            display_name: data.fullName,
            platform: data.platform,
            niche: data.niche,
            handle: data.handle,
            followers: parseInt(data.followers) || 0,
            phone: data.phone,
            email: data.email,
            city: data.city,
            updated_at: new Date().toISOString(),
          })
          .eq('firebase_uid', auth.currentUser.uid);

        if (error) throw error;
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      } catch (error: any) {
        console.error("❌ Submission Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      localStorage.setItem('pending_application', JSON.stringify(data));
      setIsSubmitting(false);
    }
  };

  return (
    <section id="about" className="py-20 sm:py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 relative transition-colors duration-500">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500 px-4 w-full max-w-sm">
          <div className="bg-[#39ff14] text-black px-6 py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] flex items-center space-x-4">
            <CheckCircle className="animate-bounce shrink-0" size={20} />
            <span className="font-black text-[10px] uppercase tracking-[0.15em]">Deployment Synchronized</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="space-y-10 md:space-y-12 order-2 lg:order-1 flex flex-col items-center lg:items-start">
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-5 py-2 rounded-none text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#ffde59]">
                <Sparkles size={12} className="text-[#ffde59] md:w-3.5 md:h-3.5" />
                <span>Identity Protocol v4.1</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-black dark:text-white tracking-tighter leading-[0.9] md:leading-[0.8] uppercase font-display italic">
                Creator <br /> <span className="text-[#834bf1] drop-shadow-[3px_3px_0px_#000] md:drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[3px_3px_0px_#fff]">Node</span>
              </h2>
              <p className="text-lg md:text-xl text-black/60 dark:text-white/60 font-black italic uppercase tracking-tight max-w-xl mx-auto lg:mx-0 border-l-[6px] md:border-l-[8px] border-[#ffde59] pl-6 md:pl-8">
                Your visual authority starts here. Claim your node and dominate the narrative.
              </p>
            </div>

            <div className="relative group w-full max-w-[340px] md:max-w-[420px] aspect-[4/5] bg-white border-[4px] md:border-[6px] border-black shadow-[12px_12px_0px_0px_#000] md:shadow-[16px_16px_0px_0px_#000] flex items-center justify-center p-4 md:p-6 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[12px_12px_0px_0px_#834bf1]">
               <div className="w-full h-full relative z-10 flex items-center justify-center scale-90 md:scale-100">
                <ThreeDCard name={formData.fullName || "AGENT IDENTITY"} handle={formData.handle || "@handle"} />
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 w-full pt-10 md:pt-0">
            <div className="bg-white border-[4px] md:border-[6px] border-black p-6 sm:p-10 lg:p-14 shadow-[12px_12px_0px_0px_#ffde59] md:shadow-[20px_20px_0px_0px_#ffde59] relative min-h-[450px] md:min-h-[500px] flex flex-col justify-center">
              <div className="absolute -top-6 md:-top-8 -right-4 md:-right-8 bg-black text-white border-[3px] md:border-[4px] border-white p-4 md:p-8 shadow-[6px_6px_0px_0px_#834bf1] md:shadow-[8px_8px_0px_0px_#834bf1] z-10 flex flex-col items-center min-w-[120px] md:min-w-[160px] rotate-2 md:rotate-3 group hover:rotate-0 transition-transform">
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none mb-1 font-display text-[#ffde59]">{waitlistCount}</h3>
                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Verified Active</p>
              </div>
              
              <div className="mb-10 md:mb-14 space-y-4 md:space-y-6">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-[#834bf1] border-[2px] md:border-[3px] border-black rotate-45"></div>
                  <h3 className="text-3xl md:text-4xl font-black text-black uppercase italic tracking-tighter font-display">Sync Node</h3>
                </div>
                <p className="text-black/50 font-black uppercase text-[10px] md:text-xs tracking-widest leading-relaxed border-b-[3px] border-black/5 pb-4 md:pb-6">
                  Initialize your profile to enter the Reelywood Alliance.
                </p>
              </div>

              <CreatorForm 
                onUpdate={handleFormUpdate} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                externalData={formData}
                onAcademyClick={onAcademyClick}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
