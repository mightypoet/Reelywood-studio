
import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader2, PartyPopper } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreatorFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(500);

  // Live counting animation: starts at 500, increments +1 every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitlistCount(prev => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleFormUpdate = (data: Partial<CreatorFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (data: CreatorFormData) => {
    setIsSubmitting(true);
    setShowToast(true);
    setIsSuccess(false);
    
    try {
      await addDoc(collection(db, 'creator_applications'), {
        ...data,
        userId: user?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        verifiedBy: null,
        verificationDate: null,
        emailSent: false,
        adminNotes: '',
        notified: false
      });
      
      // Successfully logged - trigger the success transition
      setIsSuccess(true);
      
      // Exactly 5 seconds later, reset the whole module to default state
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(false);
        setShowToast(false);
        setFormData({ ...initialFormState }); 
      }, 5000);

    } catch (error) {
      console.error("Submission Node Error:", error);
      // Fail gracefully: reset after 2 seconds on error so user isn't stuck
      setTimeout(() => {
        setIsSubmitting(false);
        setShowToast(false);
        setIsSuccess(false);
      }, 2000);
    }
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#05070a] overflow-hidden scroll-mt-24 border-y border-white/5 relative">
      {/* Action Notification Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/20 backdrop-blur-xl">
            <PartyPopper className="text-amber-300" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">✨ Applied successfully</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">
          
          {/* Visual Identity Preview (Holographic Card) */}
          <div className="space-y-8 sm:space-y-10 order-2 lg:order-1 flex flex-col items-center lg:items-start">
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-indigo-400 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
                <Sparkles size={12} className="animate-pulse" />
                <span>Holographic Render</span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                Creator <br className="hidden sm:block" /> Card
              </h2>
              <p className="text-base sm:text-lg text-slate-400 font-medium italic max-w-xl mx-auto lg:mx-0">
                The card that turns your content into currency. Post. Earn. Spend. Repeat.
              </p>
            </div>

            <div className="relative group w-full max-w-[500px] aspect-[3.5/5] rounded-[3rem] sm:rounded-[4rem] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-center p-4 sm:p-12 cursor-crosshair">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.12),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
               
               <div className="w-full h-full relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                <ThreeDCard name={formData.fullName || "Your Identity"} handle={formData.handle || "@handle"} />
               </div>
            </div>
          </div>

          {/* User Input Module (Identity Sync Form) */}
          <div className="order-1 lg:order-2 w-full">
            <div className="bg-white/[0.03] border border-white/5 p-6 sm:p-8 lg:p-12 rounded-[2.5rem] sm:rounded-[4rem] backdrop-blur-3xl shadow-2xl relative min-h-[500px] flex flex-col justify-center">
              {isSuccess && (
                <div className="absolute inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md rounded-[2.5rem] sm:rounded-[4rem] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                  <CheckCircle size={64} className="text-emerald-500 mb-6 animate-bounce" />
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Applied Successfully</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Refreshing Protocal in 5s...</p>
                </div>
              )}

              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-indigo-600 text-white p-4 px-6 sm:p-6 sm:px-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl z-10 scale-90 sm:scale-100 flex flex-col items-center min-w-[120px]">
                <h3 className="text-sm sm:text-xl font-black uppercase tracking-tighter leading-none mb-1">{waitlistCount}+</h3>
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">joined waitlist</p>
              </div>
              
              <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Claim Your Identity</h3>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                  Tell us who you are, and we’ll show you where you can go.
                </p>
              </div>

              <CreatorForm 
                onUpdate={handleFormUpdate} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                externalData={formData}
                onAcademyClick={onAcademyClick}
              />

              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5 flex items-center justify-between opacity-30">
                <div className="text-left">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">Node Status</p>
                  <p className="text-[7px] sm:text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Connected</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">Bitrate</p>
                  <p className="text-[7px] sm:text-[9px] font-bold text-indigo-400 uppercase tracking-widest">128.4 Gbps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
