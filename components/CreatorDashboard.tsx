
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { ThreeDCard } from './ThreeDCard';
import { CreatorForm } from './CreatorForm';
import { MissionsPanel } from './MissionsPanel';
import { 
  ArrowLeft, LogOut, LayoutDashboard, CreditCard, 
  Target, Award, Settings, Loader2, Sparkles, AlertCircle, 
  CheckCircle2, Edit3, X
} from 'lucide-react';

interface CreatorProfile {
  fullName: string;
  platform: string;
  niche: string;
  city: string;
  email: string;
  phone: string;
  handle: string;
  followers: string;
  cardStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

export const CreatorDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'creators', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as CreatorProfile);
      } else {
        setProfile({
          fullName: user.displayName || '',
          email: user.email || '',
          platform: '', niche: '', city: '', phone: '', handle: '', followers: '',
          cardStatus: 'none'
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleApply = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const creatorRef = doc(db, 'creators', user.uid);
      await setDoc(creatorRef, {
        ...data,
        uid: user.uid,
        email: user.email,
        cardStatus: 'pending',
        createdAt: serverTimestamp()
      }, { merge: true });

      // Enforce 1 document in creatorCards for uniqueness checks
      const cardRef = doc(db, 'creatorCards', user.uid);
      await setDoc(cardRef, {
        uid: user.uid,
        cardNumber: `RW-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pending',
        appliedAt: serverTimestamp()
      });

      setIsApplying(false);
    } catch (err) {
      console.error("Application Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-purple mx-auto" size={40} />
          <p className="font-black text-xs uppercase tracking-widest text-black/40">Syncing Identity Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-display text-black flex flex-col">
      {/* Top Header */}
      <header className="h-20 border-b-[4px] border-black flex items-center justify-between px-6 lg:px-12 bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="w-10 h-10 border-[3px] border-black flex items-center justify-center hover:bg-slate-50 shadow-[3px_3px_0px_#000] active:shadow-none transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-[#834bf1] border-[2px] border-black"></div>
             <h1 className="text-sm font-black uppercase tracking-[0.2em]">Creator Terminal</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end mr-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Authenticated User</p>
            <p className="text-xs font-black uppercase tracking-tight">{user?.displayName}</p>
          </div>
          <button onClick={logout} className="w-10 h-10 border-[3px] border-black bg-[#ffde59] flex items-center justify-center shadow-[3px_3px_0px_#000] active:shadow-none transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 lg:flex h-full overflow-hidden">
        {/* Left Panel - Card Hub */}
        <section className="lg:w-[450px] xl:w-[550px] border-r-[4px] border-black bg-slate-50/50 p-8 lg:p-12 overflow-y-auto">
          <div className="space-y-12">
            <div className="space-y-4">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Creator <br/> Identity</h2>
               <p className="text-xs font-bold text-black/60 uppercase tracking-widest">Digital Asset Management</p>
            </div>

            <div className="relative">
              {profile?.cardStatus === 'none' ? (
                <div className="aspect-[3.5/5] border-[4px] border-dashed border-black/20 rounded-none flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="w-20 h-20 bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
                    <CreditCard size={32} className="text-black/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black uppercase">No Card Active</p>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Complete sync to unlock dashboard</p>
                  </div>
                  <button 
                    onClick={() => setIsApplying(true)}
                    className="w-full bg-[#834bf1] text-white py-5 border-[3px] border-black shadow-[6px_6px_0px_#000] font-black text-[10px] uppercase tracking-[0.3em] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Apply for ID Card
                  </button>
                </div>
              ) : profile?.cardStatus === 'pending' ? (
                <div className="relative group">
                  <div className="blur-sm grayscale opacity-40 pointer-events-none">
                    <ThreeDCard name={profile?.fullName || ''} handle={profile?.handle || ''} />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4 z-20">
                    <div className="bg-[#ffde59] border-[3px] border-black px-6 py-2 shadow-[4px_4px_0px_#000]">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em]">Under Review</p>
                    </div>
                    <p className="text-sm font-bold text-black max-w-[200px]">Our curators are validating your transmission node.</p>
                  </div>
                </div>
              ) : profile?.cardStatus === 'rejected' ? (
                <div className="space-y-8">
                   <div className="aspect-[3.5/5] border-[4px] border-black bg-rose-50 flex flex-col items-center justify-center p-8 text-center space-y-6">
                      <AlertCircle size={48} className="text-rose-500" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase text-rose-600">Sync Failed</h3>
                        <p className="text-xs font-bold text-rose-500/60 uppercase tracking-widest">Protocol requirements not met</p>
                      </div>
                      <button 
                        onClick={() => setIsApplying(true)}
                        className="w-full bg-white text-black py-5 border-[3px] border-black shadow-[6px_6px_0px_#000] font-black text-[10px] uppercase tracking-[0.3em] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-3"
                      >
                        <Edit3 size={14} />
                        <span>Resubmit Identity</span>
                      </button>
                   </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-700">
                  <ThreeDCard name={profile?.fullName || ''} handle={profile?.handle || ''} />
                  <div className="mt-8 bg-emerald-50 border-[3px] border-emerald-500/30 p-5 flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Validated Entity</span>
                     </div>
                     <p className="text-[10px] font-black text-emerald-600/40 uppercase">V2.4.1</p>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_#000]">
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">ReelCoins</p>
                  <p className="text-3xl font-black">750</p>
               </div>
               <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_#000]">
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Missions</p>
                  <p className="text-3xl font-black">12</p>
               </div>
            </div>
          </div>
        </section>

        {/* Right Panel - Missions Feed */}
        <section className="flex-1 bg-white p-8 lg:p-12 overflow-y-auto">
          {profile?.cardStatus !== 'approved' ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
               <div className="w-32 h-32 rounded-full border-[4px] border-dashed border-black/10 flex items-center justify-center">
                  <Target size={48} className="text-black/10" />
               </div>
               <div className="space-y-4 max-w-sm">
                  <h3 className="text-2xl font-black uppercase">Missions Restricted</h3>
                  <p className="text-sm font-bold text-black/40 leading-relaxed uppercase tracking-widest">Missions are only visible to approved identities with active visual authority.</p>
               </div>
            </div>
          ) : (
            <MissionsPanel />
          )}
        </section>
      </main>

      {/* Application Overlay Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md" onClick={() => !isSubmitting && setIsApplying(false)}></div>
          <div className="relative w-full max-w-2xl bg-white border-[6px] border-black p-10 lg:p-14 shadow-[24px_24px_0px_#000] animate-in slide-in-from-bottom-10">
            <button 
              disabled={isSubmitting}
              onClick={() => setIsApplying(false)} 
              className="absolute top-8 right-8 text-black hover:rotate-90 transition-transform"
            >
              <X size={32} />
            </button>
            
            <div className="mb-12 space-y-4">
              <div className="inline-flex items-center space-x-3 bg-black text-white px-5 py-2">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Auth Protocol</span>
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Sync Node</h2>
              <p className="text-sm font-bold text-black/60 uppercase tracking-widest leading-relaxed">Ensure all parameters match your active digital presence.</p>
            </div>

            <CreatorForm 
              isSubmitting={isSubmitting}
              onUpdate={() => {}}
              onSubmit={handleApply}
              externalData={profile || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};
