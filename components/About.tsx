
import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader2, PartyPopper } from 'lucide-react';
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
    // Authenticated path: Direct Sync
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
      // Anonymous path: Handled by CreatorForm's local storage logic
      localStorage.setItem('pending_application', JSON.stringify(data));
      // Just visually proceed
      setIsSubmitting(false);
    }
  };

  return (
    <section id="about" className="py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 relative transition-colors duration-500">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#39ff14] text-black px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#000] flex items-center space-x-4">
            <CheckCircle className="animate-bounce" size={24} />
            <span className="font-black text-sm uppercase tracking-[0.2em]">Deployment Synchronized</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="space-y-12 order-2 lg:order-1 flex flex-col items-center lg:items-start">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.5em] shadow-[4px_4px_0px_0px_#ffde59]">
                <Sparkles size={14} className="text-[#ffde59]" />
                <span>Identity Protocol v4.1</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter leading-[0.8] uppercase font-display italic">
                Creator <br /> <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Node</span>
              </h2>
              <p className="text-xl text-black/60 dark:text-white/60 font-black italic uppercase tracking-tight max-w-xl mx-auto lg:mx-0 border-l-[8px] border-[#ffde59] pl-8">
                Your visual authority starts here. Claim your node and dominate the narrative.
              </p>
            </div>

            <div className="relative group w-full max-w-[420px] aspect-[4/5] bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000] flex items-center justify-center p-6 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[12px_12px_0px_0px_#834bf1]">
               <div className="w-full h-full relative z-10 flex items-center justify-center">
                <ThreeDCard name={formData.fullName || "AGENT IDENTITY"} handle={formData.handle || "@handle"} />
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 w-full">
            <div className="bg-white border-[6px] border-black p-10 lg:p-14 shadow-[20px_20px_0px_0px_#ffde59] relative min-h-[500px] flex flex-col justify-center">
              <div className="absolute -top-8 -right-8 bg-black text-white border-[4px] border-white p-8 shadow-[8px_8px_0px_0px_#834bf1] z-10 flex flex-col items-center min-w-[160px] rotate-3 group hover:rotate-0 transition-transform">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-1 font-display text-[#ffde59]">{waitlistCount}</h3>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Verified Active</p>
              </div>
              
              <div className="mb-14 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-[#834bf1] border-[3px] border-black rotate-45"></div>
                  <h3 className="text-4xl font-black text-black uppercase italic tracking-tighter font-display">Sync Node</h3>
                </div>
                <p className="text-black/50 font-black uppercase text-xs tracking-widest leading-relaxed border-b-[3px] border-black/5 pb-6">
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
