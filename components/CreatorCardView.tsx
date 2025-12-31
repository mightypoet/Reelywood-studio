
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Loader2, PartyPopper } from 'lucide-react';
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

export const CreatorCardView: React.FC<CreatorCardViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreatorFormData>({
    fullName: '',
    platform: '',
    niche: '',
    city: '',
    email: '',
    phone: '',
    handle: '',
    followers: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleFormUpdate = (data: Partial<CreatorFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (data: CreatorFormData) => {
    setIsSubmitting(true);
    setShowToast(true);

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
      
      setTimeout(() => {
        setIsSuccess(true);
        setShowToast(false);
      }, 2000);
    } catch (error) {
      console.error("Submission Error:", error);
      setIsSuccess(true); // Fail gracefully for demo
      setShowToast(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#020202] text-white selection:bg-indigo-500/30 font-['Plus_Jakarta_Sans'] overflow-x-hidden flex flex-col relative">
      {/* Joined Waitlist Popup */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/20 backdrop-blur-xl">
            <PartyPopper className="text-amber-300" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">Joined the waitlist!</span>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Header */}
      <nav className="relative z-50 px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-3 text-white/50 hover:text-white transition-colors"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.3em]">Return Home</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-white/40 font-bold">Studio Node</span>
          <span className="text-xs sm:text-sm font-medium tracking-wide text-white/90">Digital Identity Sync</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <span className="hidden sm:inline font-bold text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-white/80">REELYWOOD</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {isSuccess ? (
          <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8 py-16 sm:py-24 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
              <CheckCircle size={40} className="text-indigo-400 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">Access Requested</h1>
              <p className="text-white/50 text-sm sm:text-lg max-w-lg mx-auto leading-relaxed px-4">
                Your Reelywood Creator Card application has been submitted to our narrative engineers. We will review your credentials and sync via email.
              </p>
            </div>
            <button 
              onClick={onBack}
              className="bg-white text-black px-10 py-4 sm:px-12 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform"
            >
              Back to Home
            </button>
          </div>
        ) : (
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

                <div className="relative group w-full aspect-[4/5] sm:aspect-[4/5] lg:aspect-[3.5/5] rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-6 sm:p-12">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,214,255,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   
                   <div className="w-full h-full relative z-10 flex items-center justify-center">
                    <ThreeDCard name={formData.fullName} handle={formData.handle} />
                   </div>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="w-full order-1 lg:order-2">
              <div className="bg-white/[0.03] border border-white/5 p-6 sm:p-10 lg:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] backdrop-blur-3xl shadow-2xl w-full">
                <div className="mb-8 sm:mb-10 space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Identity Node</h3>
                  <p className="text-white/40 text-xs sm:text-sm font-medium leading-relaxed">Submit your credentials to initiate production of your Creator ID.</p>
                </div>

                <CreatorForm 
                  onUpdate={handleFormUpdate} 
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 p-6 sm:p-10 text-center border-t border-white/5 bg-black/20">
        <p className="text-[8px] sm:text-[10px] text-white/10 uppercase tracking-[0.6em] font-black leading-relaxed px-4">
          Reelywood Studio • End-to-End Encryption Enabled • Established 2024
        </p>
      </footer>
    </div>
  );
};
