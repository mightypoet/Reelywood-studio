import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { 
  X, Wallet, Zap, Gift, CheckCircle, 
  TrendingUp, Clock, ShieldCheck, Plus, 
  Minus, Loader2, Instagram, MapPin
} from 'lucide-react';

interface AgentDetailViewProps {
  agent: any;
  onClose: () => void;
}

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, onClose }) => {
  const [stats, setStats] = useState({ completionRate: 0, totalEarned: 0, vouchersClaimed: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');

  useEffect(() => {
    fetchAgentIntel();
  }, [agent.id]);

  const fetchAgentIntel = async () => {
    if (!supabase) return;
    try {
      const [subs, txs] = await Promise.all([
        supabase.from('submissions').select('*').eq('user_id', agent.firebase_uid),
        supabase.from('transactions').select('*').eq('user_uid', agent.firebase_uid).order('created_at', { ascending: false })
      ]);

      const approvedCount = subs.data?.filter(s => s.status === 'approved').length || 0;
      const totalSubs = subs.data?.length || 0;
      const rate = totalSubs > 0 ? Math.round((approvedCount / totalSubs) * 100) : 0;
      
      const earned = txs.data?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
      const claimed = txs.data?.filter(t => t.amount < 0).length || 0;

      setStats({ completionRate: rate, totalEarned: earned, vouchersClaimed: claimed });
      setHistory(txs.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdjustBalance = async (type: 'credit' | 'debit') => {
    if (!adjustAmount || isNaN(Number(adjustAmount))) return;
    if (!supabase) return;
    
    setAdjusting(true);
    const amount = type === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);
    
    try {
      const { error } = await supabase.rpc('adjust_user_balance', {
        target_uid: agent.firebase_uid,
        amount_delta: amount,
        reason: `ADMIN_ADJUSTMENT: Manual override`
      });

      if (error) throw error;
      setAdjustAmount('');
      fetchAgentIntel();
    } catch (err: any) {
      alert("Terminal Sync Failure: " + err.message);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full bg-white border-t-[6px] border-black rounded-t-[3rem] p-8 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-500 shadow-[0_-10px_50px_rgba(0,0,0,0.3)]">
        
        {/* Header Hook */}
        <div className="w-16 h-2 bg-slate-200 rounded-full mx-auto mb-8"></div>
        
        <div className="flex justify-between items-start mb-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 border-[4px] border-black bg-[#834bf1] shadow-[4px_4px_0px_0px_#000] overflow-hidden">
                <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.id}`} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase font-display leading-none">{agent.display_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Instagram size={14} className="text-[#834bf1]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">@{agent.handle || 'unlinked'}</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-slate-100 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
             <X size={24} strokeWidth={4} />
           </button>
        </div>

        {/* 360 METRICS */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-slate-50 border-[3px] border-black p-4 text-center">
            <span className="block text-2xl font-black italic font-display text-[#834bf1]">{stats.completionRate}%</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">QC Passed</span>
          </div>
          <div className="bg-slate-50 border-[3px] border-black p-4 text-center">
            <span className="block text-2xl font-black italic font-display text-emerald-600">{stats.totalEarned}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Gross RC</span>
          </div>
          <div className="bg-slate-50 border-[3px] border-black p-4 text-center">
            <span className="block text-2xl font-black italic font-display text-[#ffde59] drop-shadow-[1px_1px_0px_#000]">{stats.vouchersClaimed}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Perks Used</span>
          </div>
        </div>

        {/* VAULT LOG */}
        <div className="mb-10">
          <div className="flex items-center justify-between border-b-2 border-black/5 pb-4 mb-4">
             <h4 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 italic">
               <Wallet size={16} /> Asset Ledger
             </h4>
             <span className="text-xl font-black text-emerald-600 italic font-display">{agent.reelcoins} RC</span>
          </div>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-10 text-center opacity-20 animate-pulse font-black text-[10px] uppercase">Retrieving Vault Data...</div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center opacity-20 italic font-black text-[10px] uppercase">No transactions detected.</div>
            ) : (
              history.map(tx => (
                <div key={tx.id} className="flex justify-between items-center bg-slate-50 p-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.05)]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[200px]">{tx.description || 'System Update'}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString()}</p>
                  </div>
                  <span className={`text-xs font-black italic ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* OPS INTERFACE */}
        <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#834bf1] mb-10">
          <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
            <ShieldCheck size={16} className="text-[#ffde59]" /> Balance Override
          </h4>
          <div className="space-y-6">
            <div className="relative">
              <input 
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="INPUT VALUE (RC)..." 
                className="w-full bg-transparent border-b-4 border-white/20 p-4 font-black italic text-2xl focus:border-[#ffde59] focus:outline-none transition-colors placeholder:text-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAdjustBalance('credit')}
                disabled={adjusting}
                className="bg-[#39ff14] text-black py-4 font-black uppercase text-xs tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all disabled:opacity-30">
                {adjusting ? <Loader2 className="animate-spin" /> : <><Plus size={16} strokeWidth={4}/> CREDIT</>}
              </button>
              <button 
                onClick={() => handleAdjustBalance('debit')}
                disabled={adjusting}
                className="bg-rose-500 text-white py-4 font-black uppercase text-xs tracking-widest border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all disabled:opacity-30">
                {adjusting ? <Loader2 className="animate-spin" /> : <><Minus size={16} strokeWidth={4}/> DEBIT</>}
              </button>
            </div>
          </div>
        </div>

        <button className="w-full py-5 border-4 border-black text-black font-black uppercase text-xs tracking-[0.4em] italic hover:bg-slate-50 transition-colors mb-10">
           Suspend Node Access
        </button>
      </div>
    </div>
  );
};
