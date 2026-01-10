import React, { useState } from 'react';
import { supabase } from '../../lib/clients';
import { Check, X, ExternalLink, ShieldAlert, Loader2 } from 'lucide-react';

interface VerificationModalProps {
  submission: any;
  onClose: () => void;
  onRefresh: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ submission, onClose, onRefresh }) => {
  const [checks, setChecks] = useState<boolean[]>(submission.checklist_state || [false, false, false]);
  const [loading, setLoading] = useState(false);

  const checkpoints = submission.missions?.checkpoints || ["Check 1", "Check 2", "Check 3"];
  const reward = submission.missions?.reward_amount || 0;

  const toggleCheck = (index: number) => {
    const newChecks = [...checks];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
  };

  const handleGrant = async () => {
    if (checks.some(c => !c)) {
       if(!window.confirm("Not all criteria met. Grant reward anyway?")) return;
    }

    setLoading(true);
    try {
      if (!supabase) return;

      // 1. Pay User via RPC
      const { error: rpcError } = await supabase.rpc('increment_rc', { 
         user_id_param: submission.user_id, 
         amount_param: reward 
      });
      if (rpcError) throw rpcError;

      // 2. Update Submission
      const { error: subError } = await supabase.from('submissions').update({
         status: 'approved',
         checklist_state: checks
      }).eq('id', submission.id);
      if (subError) throw subError;

      // 3. Create Transaction Log
      await supabase.from('transactions').insert([{
        user_uid: submission.user_id,
        amount: reward,
        description: `Verified: ${submission.missions?.title}`
      }]);

      // 4. Notify Agent
      await supabase.from('notifications').insert([{
         user_id: submission.user_id,
         title: '✅ MISSION ACCOMPLISHED',
         message: `Your work for "${submission.missions?.title}" has been verified. +${reward} RC transferred.`
      }]);

      alert("🚀 Mission Accomplished! Reward authorized.");
      onRefresh();
      onClose();
    } catch (err: any) {
      alert("Terminal Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg border-[6px] border-black shadow-[16px_16px_0px_0px_#39ff14] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#39ff14] translate-x-12 -translate-y-12 rotate-45 border-l-4 border-b-4 border-black"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors">
           <X size={20} strokeWidth={3} />
        </button>

        <div className="space-y-2 mb-10">
          <h2 className="text-3xl font-black italic uppercase font-display tracking-tighter text-black">Verify Intel</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 italic">Agent ID: {submission.user_id.slice(0,12)}...</p>
        </div>

        {/* EVIDENCE LINK */}
        <div className="bg-slate-50 border-[3px] border-black p-6 mb-8 flex justify-between items-center group">
           <div className="truncate font-black text-sm text-[#834bf1] italic group-hover:underline">
              <a href={submission.link} target="_blank" rel="noreferrer">{submission.link}</a>
           </div>
           <a href={submission.link} target="_blank" rel="noreferrer" className="bg-black text-white border-2 border-black p-3 hover:bg-[#ffde59] hover:text-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
              <ExternalLink size={18} strokeWidth={3} />
           </a>
        </div>

        {/* CHECKLIST */}
        <div className="space-y-4 mb-10">
           <p className="font-black text-[10px] uppercase tracking-[0.4em] text-black/30 italic mb-4">Manual Override Checks:</p>
           {checkpoints.map((pt: string, i: number) => (
              <div key={i} 
                   onClick={() => toggleCheck(i)}
                   className={`p-5 border-[3px] cursor-pointer flex items-center gap-5 transition-all active:scale-[0.98] ${checks[i] ? 'bg-[#39ff14] border-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white border-slate-200 hover:border-black'}`}>
                 <div className={`w-8 h-8 border-[3px] border-black flex items-center justify-center shrink-0 ${checks[i] ? 'bg-black text-white' : 'bg-white'}`}>
                    {checks[i] && <Check size={20} strokeWidth={4} />}
                 </div>
                 <span className="font-black text-xs uppercase tracking-tight leading-none">{pt}</span>
              </div>
           ))}
        </div>

        {/* ACTION BUTTON */}
        <button 
           onClick={handleGrant}
           disabled={loading}
           className="w-full bg-black text-white py-6 font-black uppercase text-sm tracking-[0.4em] border-[4px] border-black hover:bg-[#39ff14] hover:text-black shadow-[8px_8px_0px_0px_#834bf1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 active:scale-95"
        >
           {loading ? <Loader2 className="animate-spin mx-auto" /> : `Authorize ${reward} RC Reward`}
        </button>

        <div className="mt-8 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20">Authorized Terminal Session</p>
        </div>
      </div>
    </div>
  );
};