
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
      
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(false);
        setShowToast(false);
        setFormData({ ...initialFormState }); 
      }, 5000);

    } catch (error) {
      console.error("Submission Node Error:", error);
      setTimeout(() => {
        setIsSubmitting(false);
        setShowToast(false);
        setIsSuccess(false);
      }, 2000);
    }
  };

  return (
    <section id="about" className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 relative transition-colors duration-500">
      {/* Action Notification Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#834bf1] text-white px-8 py-4 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ffffff] flex items-center space-x-4">
            <PartyPopper className="text-[#ffde59]" />
            <span className="font-black text-sm uppercase tracking-[0.2em]">Sync Success</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="space-y-10 order-2 lg:order-1 flex flex-col items-center lg:items-start">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-[#ffde59] border-2 border-black dark:border-white px-5 py-2.5 rounded-full text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
                <Sparkles size={12} className="animate-pulse" />
                <span>Visual Protocol</span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-black dark:text-white tracking-tighter leading-[0.9] uppercase font-display">
                Creator <br /> Card
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-bold max-w-xl mx-auto lg:mx-0">
                Unlock your digital potential. Post. Earn. Dominate.
              </p>
            </div>

            <div className="relative group w-full max-w-[450px] aspect-[3.5/5] bg-white dark:bg-[#111] border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000000] dark:shadow-[12px_12px_0px_0px_#ffffff] flex items-center justify-center p-6 cursor-crosshair transition-transform hover:-translate-y-2">
               <div className="w-full h-full relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                <ThreeDCard name={formData.fullName || "Your Identity"} handle={formData.handle || "@handle"} />
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 w-full">
            <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-8 sm:p-12 shadow-[12px_12px_0px_0px_#000000] dark:shadow-[12px_12px_0px_0px_#ffffff] relative min-h-[500px] flex flex-col justify-center transition-colors duration-500">
              {isSuccess && (
                <div className="absolute inset-0 z-50 bg-[#834bf1] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                  <CheckCircle size={64} className="text-white mb-6 animate-bounce" />
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Authenticated</h3>
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">Identity Node Locked In</p>
                </div>
              )}

              <div className="absolute -top-6 -right-6 bg-[#ffde59] text-black border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ffffff] z-10 flex flex-col items-center min-w-[140px]">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 font-display">{waitlistCount}+</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verified Users</p>
              </div>
              
              <div className="mb-12 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-[#834bf1] border-2 border-black dark:border-white rounded-full"></div>
                  <h3 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight font-display">Sync Identity</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">
                  Join the elite network of performance-driven creators.
                </p>
              </div>

              <CreatorForm 
                onUpdate={handleFormUpdate} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                externalData={formData}
                /* Fix: Changed handleAcademyClick to onAcademyClick to use the passed prop */
                onAcademyClick={onAcademyClick}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
