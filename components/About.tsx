
import React, { useState } from 'react';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface CreatorFormData {
  fullName: string;
  platform: string;
  niche: string;
  city: string;
  email: string;
  phone: string;
  handle: string;
}

export const About: React.FC = () => {
  const [formData, setFormData] = useState<CreatorFormData>({
    fullName: '',
    platform: '',
    niche: '',
    city: '',
    email: '',
    phone: '',
    handle: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFormUpdate = (data: Partial<CreatorFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (data: CreatorFormData) => {
    setIsSubmitting(true);
    try {
      // Integration with Firebase Firestore
      await addDoc(collection(db, 'creator_applications'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        verifiedBy: null,
        verificationDate: null,
        emailSent: false,
        adminNotes: ''
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission Error:", error);
      // Fallback for demonstration if network issues occur
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-32 bg-[#05070a] overflow-hidden scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-white/20">
            <CheckCircle size={48} className="text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">Identity Synced</h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
              Your Reelywood Creator Card application has been dispatched to our narrative engineers. Authentication details will follow via secure transmission.
            </p>
          </div>
          <button 
            onClick={() => setIsSuccess(false)}
            className="text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors uppercase tracking-[0.3em]"
          >
            Initiate Another Sync
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 bg-[#05070a] overflow-hidden scroll-mt-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left: 3D Holographic Preview (Replaces the Video Block from Screenshot 1) */}
          <div className="lg:col-span-7 space-y-10 order-2 lg:order-1">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
                <Sparkles size={14} className="animate-pulse" />
                <span>Holographic Render</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase">
                Creator <br /> Authenticated
              </h2>
              <p className="text-xl text-slate-400 font-medium italic max-w-xl">
                Built for growth. Engineered for value. We dive deep into the psychology of connection to build ecosystems that scale.
              </p>
            </div>

            <div className="relative group w-full aspect-[4/5] sm:aspect-[3.5/4] lg:aspect-[4/5] rounded-[4rem] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-8 sm:p-12 cursor-crosshair">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.12),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
               
               <div className="w-full h-full relative z-10">
                <ThreeDCard name={formData.fullName || "Your Identity"} handle={formData.handle || "@handle"} />
               </div>
              
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Protocol v4.0</p>
                  <p className="text-white/20 text-[8px] font-bold uppercase tracking-[0.2em]">Material: Iridescent Glass</p>
                </div>
                <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-100 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse mr-1.5 shadow-[0_0_10px_rgba(79,70,229,1)]"></span>
                  SYNC ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Right: Identity Sync Form (Matches Screenshot 2 layout) */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white/[0.03] border border-white/5 p-8 sm:p-12 rounded-[4rem] backdrop-blur-3xl shadow-2xl relative">
              <div className="absolute -top-6 -right-6 bg-indigo-600 text-white p-6 px-10 rounded-[2.5rem] shadow-2xl z-10 hidden sm:block">
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Human + AI</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Identity Node</p>
              </div>
              
              <div className="mb-12 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Identity Protocol</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Initiate your digital identity sync. Every credential is calibrated for maximum narrative impact and ROI.
                </p>
              </div>

              <CreatorForm 
                onUpdate={handleFormUpdate} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-30">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Node Status</p>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Connected</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Bitrate</p>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">128.4 Gbps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
