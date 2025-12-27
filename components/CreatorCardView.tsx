
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';

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
    // Simulate API delay and data storage
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to localStorage for demo persistence (simulating the creator_card_requests table logic)
    const submissions = JSON.parse(localStorage.getItem('creator_card_requests') || '[]');
    submissions.push({
      ...data,
      id: crypto.randomUUID(),
      submission_timestamp: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('creator_card_requests', JSON.stringify(submissions));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-['Plus_Jakarta_Sans'] overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
      </div>

      {/* Header */}
      <nav className="relative z-50 px-6 py-8 flex items-center justify-between max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-3 text-white/50 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit Universe</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <span className="font-bold text-[11px] tracking-[0.4em] uppercase text-white/80">REELYWOOD</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        {isSuccess ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-24 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
              <CheckCircle size={48} className="text-indigo-400" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight uppercase">Universe Request Sent</h1>
              <p className="text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
                Your Reelywood Creator Card is currently being reviewed by our narrative engineers. Check your inbox for the next transmission.
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
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            {/* Left: 3D Preview */}
            <div className="lg:col-span-7 sticky top-24">
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-indigo-400 font-black text-[9px] uppercase tracking-[0.4em]">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Real-time Live Render</span>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                      Your Identity.
                    </h1>
                    <div className="h-16 md:h-24 w-full bg-gradient-to-r from-indigo-500/60 to-purple-500/60 rounded-3xl blur-sm animate-pulse"></div>
                  </div>
                </div>

                <div className="h-[500px] lg:h-[750px] relative rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 shadow-2xl overflow-hidden group">
                  <ThreeDCard name={formData.fullName} />
                  
                  {/* HUD Elements */}
                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="space-y-1">
                      <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Status: Ready</p>
                      <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.2em]">Material: Dark Chrome Alloy</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></span>
                      Direct Sync Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Onboarding Form */}
            <div className="lg:col-span-5">
              <div className="bg-white/[0.02] border border-white/5 p-8 lg:p-12 rounded-[3.5rem] backdrop-blur-2xl shadow-2xl">
                <div className="mb-10 space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Onboarding</h3>
                  <p className="text-white/40 text-sm font-medium">Complete your profile to join the creator elite.</p>
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
    </div>
  );
};
