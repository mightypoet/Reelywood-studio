
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Loader2, PartyPopper, Menu } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface CreatorCardViewProps {
  onBack: () => void;
}

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

export const CreatorCardView: React.FC<CreatorCardViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreatorFormData>(initialFormState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
      
      // Successfully pushed to database - trigger success transition
      setIsSuccess(true);
      
      // Exactly 5 seconds later, reset everything to default state
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false); // Restore button to interactive state
        setShowToast(false); // Remove toast
        setFormData({ ...initialFormState }); // Clear input fields
      }, 5000);

    } catch (error) {
      console.error("Submission Error:", error);
      // Reset after error
      setTimeout(() => {
        setIsSubmitting(false);
        setShowToast(false);
        setIsSuccess(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#020202] text-white selection:bg-indigo-500/30 font-['Plus_Jakarta_Sans'] overflow-x-hidden flex flex-col relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/20 backdrop-blur-xl">
            <PartyPopper className="text-amber-300" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">✨ Applied successfully</span>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Glass Pill Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-4 py-2 flex items-center justify-between shadow-2xl">
          <button onClick={onBack} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xs">R</span>
            </div>
            <span className="font-black text-[11px] uppercase tracking-[0.2em] text-white/90">REELYWOODSTUDIO</span>
          </button>
          
          <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <Menu size={18} className="text-white/80" />
          </button>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full">
          {/* 3D Preview Container */}
          <div className="flex flex-col items-center justify-center w-full order-2 lg:order-1">
            <div className="w-full max-w-[500px] space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-indigo-400 font-black text-[8px] sm:text-[9px] uppercase tracking-[0.4em]">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>Holographic Render</span>
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
                  Creator <br className="hidden sm:block"/> Authenticated
                </h1>
              </div>

              <div className="relative group w-full aspect-[4/5] rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-center p-2 sm:p-12">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,214,255,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                 
                 <div className="w-full h-full relative z-10 flex items-center justify-center scale-75 sm:scale-100">
                  <ThreeDCard name={formData.fullName} handle={formData.handle} />
                 </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="w-full order-1 lg:order-2">
            <div className="bg-white/[0.03] border border-white/5 p-6 sm:p-10 lg:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] backdrop-blur-3xl shadow-2xl w-full relative min-h-[500px] flex flex-col justify-center">
              {isSuccess && (
                <div className="absolute inset-0 z-50 bg-indigo-600/95 backdrop-blur-md rounded-[2.5rem] sm:rounded-[3.5rem] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                  <CheckCircle size={64} className="text-white mb-6 animate-bounce" />
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-2">Applied Successfully</h3>
                  <p className="text-white/80 text-sm font-medium">Your credentials have been logged. <br/> Returning to form in 5 seconds...</p>
                </div>
              )}

              <div className="mb-8 sm:mb-10 space-y-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Identity Node</h3>
                <p className="text-white/40 text-xs sm:text-sm font-medium leading-relaxed">Submit your credentials to initiate production of your Creator ID.</p>
              </div>

              <CreatorForm 
                onUpdate={handleFormUpdate} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                externalData={formData}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-6 sm:p-10 text-center border-t border-white/5 bg-black/20 mt-auto">
        <p className="text-[8px] sm:text-[10px] text-white/10 uppercase tracking-[0.6em] font-black leading-relaxed px-4">
          Reelywood Studio • End-to-End Encryption Enabled • Established 2024
        </p>
      </footer>
    </div>
  );
};
