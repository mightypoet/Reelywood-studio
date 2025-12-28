
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
}

export const CreatorCardView: React.FC<CreatorCardViewProps> = ({ onBack }) => {
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
      // Save to Firebase Firestore
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
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 font-['Plus_Jakarta_Sans'] overflow-x-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Header */}
      <nav className="relative z-50 px-6 py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-3 text-white/50 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.3em]">Return Home</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-bold">Studio Node</span>
          <span className="text-sm font-medium tracking-wide text-white/90">Digital Identity Sync</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <span className="hidden sm:inline font-bold text-[11px] tracking-[0.4em] uppercase text-white/80">REELYWOOD</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center max-w-7xl mx-auto px-6 py-12 w-full">
        {isSuccess ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-24 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
              <CheckCircle size={48} className="text-indigo-400" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">Access Requested</h1>
              <p className="text-white/50 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                Your Reelywood Creator Card application has been submitted to our narrative engineers. We will review your credentials and sync via email.
              </p>
            </div>
            <button 
              onClick={onBack}
              className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center w-full">
            {/* Left: 3D Preview Container */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center w-full order-2 lg:order-1">
              <div className="w-full max-w-[540px] space-y-8">
                <div className="space-y-4 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-indigo-400 font-black text-[9px] uppercase tracking-[0.4em]">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Holographic Render</span>
                  </div>
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none uppercase">
                    Creator <br className="hidden sm:block"/> Authenticated
                  </h1>
                </div>

                <div className="relative group w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3.5/5] rounded-[3.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-12">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,214,255,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   
                   <div className="w-full h-full relative z-10 flex items-center justify-center">
                    <ThreeDCard name={formData.fullName} handle={formData.handle} />
                   </div>
                  
                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="space-y-1">
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Protocol v4.0</p>
                      <p className="text-white/20 text-[8px] font-bold uppercase tracking-[0.2em]">Material: Iridescent Glass</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-100">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse mr-1.5 shadow-[0_0_10px_rgba(79,70,229,1)]"></span>
                      SYNC ACTIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 w-full order-1 lg:order-2">
              <div className="bg-white/[0.03] border border-white/5 p-8 sm:p-10 lg:p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl w-full">
                <div className="mb-10 space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Identity Node</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Submit your credentials to initiate production of your Creator ID.</p>
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

      <footer className="relative z-10 p-10 text-center border-t border-white/5 bg-black/20">
        <p className="text-[10px] text-white/10 uppercase tracking-[0.6em] font-black">
          Reelywood Studio • End-to-End Encryption Enabled • Established 2024
        </p>
      </footer>
    </div>
  );
};
