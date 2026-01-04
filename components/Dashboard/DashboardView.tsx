
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
            <Sparkles size={40} />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user?.displayName?.split(' ')[0]}</h1>
            <p className="text-slate-500 font-medium">Your creative headquarters is ready.</p>
          </div>
          <button 
            onClick={() => setShowLanding(false)}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            Enter Creator Dashboard
          </button>
          <button 
            onClick={onBack}
            className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            Return to Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] font-['Plus_Jakarta_Sans'] transition-colors duration-500">
      {/* Dashboard Top Header */}
      <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">R</div>
            <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Creator Hub</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-black text-slate-900 dark:text-white">{user?.displayName}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Creator ID: {user?.uid.slice(0, 8)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-white/10 overflow-hidden">
            <img src={user?.photoURL || ''} alt="User" />
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
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
