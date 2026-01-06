
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ArrowLeft, Sparkles, Loader2, Zap, ShieldCheck } from 'lucide-react';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [cardStatus, setCardStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen for Card Status
    const cardRef = doc(db, 'creator_cards', user.uid);
    const unsubCard = onSnapshot(cardRef, (docSnap) => {
      if (docSnap.exists()) {
        setCardStatus(docSnap.data().status);
      } else {
        // Check old application collection too for fallback
        const appRef = query(collection(db, 'creator_applications'), where('userId', '==', user.uid));
        getDocs(appRef).then(snap => {
          if (!snap.empty) setCardStatus('pending');
        });
      }
    });

    // Listen for Wallet
    const walletRef = doc(db, 'wallets', user.uid);
    const unsubWallet = onSnapshot(walletRef, (docSnap) => {
      if (docSnap.exists()) {
        setWalletBalance(docSnap.data().balance || 0);
      }
    });

    setLoading(false);
    return () => {
      unsubCard();
      unsubWallet();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#834bf1]" size={48} />
      </div>
    );
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Dots Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>
        
        <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#ffde59]">
            <ShieldCheck size={14} className="text-[#ffde59] animate-pulse" />
            <span>Identity Authenticated</span>
          </div>

          <div className="bg-[#ffde59] border-[6px] border-black p-10 sm:p-14 shadow-[16px_16px_0px_0px_#000000] dark:shadow-[16px_16px_0px_0px_#834bf1] space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tighter uppercase font-display italic leading-none">
                Welcome, <br />
                <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#fff]">{user?.displayName?.split(' ')[0]}</span>
              </h1>
              <p className="text-black text-xs font-black uppercase tracking-[0.2em] italic opacity-70">
                Protocol: Creator Command Center Ready
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={() => setShowLanding(false)}
                className="w-full bg-[#834bf1] text-white py-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] font-black text-sm uppercase tracking-[0.4em] italic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-3 group"
              >
                <span>Enter Dashboard</span>
                <Zap size={18} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
              </button>
              
              <button 
                onClick={onBack}
                className="w-full bg-white text-black py-4 border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] font-black text-xs uppercase tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Return to Mission Control
              </button>
            </div>
          </div>
          
          <p className="text-[10px] font-black text-black/30 dark:text-white/20 uppercase tracking-[0.5em]">
            Reelywood Studio • Node 4.01 Secure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-500 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>

      {/* Neobrutalist Dashboard Header */}
      <header className="h-24 border-b-[4px] border-black dark:border-white bg-white dark:bg-[#0a0a0a] px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onBack} 
            className="w-12 h-12 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center hover:bg-slate-50 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <ArrowLeft size={20} strokeWidth={3} className="text-black" />
          </button>
          
          <div className="hidden sm:flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#834bf1] border-[3px] border-black text-white flex items-center justify-center font-black italic">R</div>
            <div>
              <span className="font-black text-xs uppercase tracking-[0.2em] text-black dark:text-white block">Creator Hub</span>
              <span className="text-[8px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Active Session</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs font-black text-black dark:text-white uppercase italic">{user?.displayName}</span>
            <span className="text-[8px] font-black text-[#834bf1] uppercase tracking-widest">Verified Creator</span>
          </div>
          <div className="w-12 h-12 border-[3px] border-black bg-[#ffde59] shadow-[4px_4px_0px_0px_#000] overflow-hidden">
            <img src={user?.photoURL || ''} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-5 xl:col-span-4">
          <LeftPanel cardStatus={cardStatus} balance={walletBalance} />
        </div>
        <div className="lg:col-span-7 xl:col-span-8">
          <RightPanel status={cardStatus} />
        </div>
      </main>
    </div>
  );
};
