import React, { useState } from 'react';
import { supabase } from '../../lib/clients';
import { Check, X, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

interface VerificationModalProps {
  submission: any;
  onClose: () => void;
  onRefresh: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ submission, onClose, onRefresh }) => {
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [loading, setLoading] = useState(false);

  // Extract info from joined data
  const checkpoints = submission.missions?.checkpoints && submission.missions.checkpoints.length >= 3 
    ? submission.missions.checkpoints 
    : ["Verify Link Authority", "Quality Control Check", "Tag/Caption Audit"];
  
  const reward = submission.missions?.reward_amount || 0;

  const toggleCheck = (index: number) => {
    const newChecks = [...checks];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
  };

  const handleGrant = async () => {
    // Validation: All 3 checkpoints must be verified
    if (checks.some(c => !c)) {
       alert("⚠️ PROTOCOL VIOLATION: You must verify all 3 factors before granting rewards.");
       return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Database terminal unavailable.");

      // Execute reward grant via secure RPC
      const { error } = await supabase.rpc('grant_mission_reward', {
         submission_id_param: submission.id,
         user_id_param: submission.user_id,
         amount_param: reward
      });

      if (error) throw error;

      alert("🚀 SIGNAL VERIFIED: Reward Granted & User Notified.");
      onRefresh(); 
      onClose();   
    } catch (err: any) {
      alert("Terminal Critical Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg border-[6px] border-black shadow-[16px_16px_0px_0px_#4ade80] p-8 md:p-12 relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors shadow-[4px_4px_0px_0px_#000]">
           <X size={20} strokeWidth={3} />
        </button>

        <div className="space-y-2 mb-10">
          <h2 className="text-3xl font-black italic uppercase font-display tracking-tighter text-black">Verify Signal</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 italic flex items-center gap-2">
            <ShieldCheck size={14} strokeWidth={3} /> Security Clearance Required
          </p>
        </div>

        {/* EVIDENCE LINK */}
        <div className="bg-slate-50 border-[3px] border-black p-6 mb-8">
           <p className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] mb-3">Incoming Deliverable</p>
           <div className="flex justify-between items-center gap-4">
               <a href={submission.link} target="_blank" rel="noreferrer" className="truncate font-black text-sm text-blue-600 underline italic hover:text-blue-800 transition-colors">
                  {submission.link}
               </a>
               <a href={submission.link} target="_blank" rel="noreferrer" className="bg-[#ffde59] border-[3px] border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 active:scale-95">
                  <ExternalLink size={20} strokeWidth={3} />
               </a>
           </div>
        </div>

        {/* CHECKLIST */}
        <div className="space-y-4 mb-10">
           <p className="font-black text-[10px] uppercase tracking-[0.4em] text-black/30 italic mb-4">Quality Control Checklist:</p>
           {checkpoints.slice(0, 3).map((pt: string, i: number) => (
              <div key={i} 
                   onClick={() => toggleCheck(i)}
                   className={`p-5 border-[3px] cursor-pointer flex items-center gap-5 transition-all active:scale-[0.98] ${checks[i] ? 'bg-[#4ade80] border-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white border-slate-200 hover:border-black'}`}>
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
           className="w-full bg-black text-white py-6 font-black uppercase text-sm tracking-[0.4em] border-[4px] border-black hover:bg-[#ffde59] hover:text-black shadow-[8px_8px_0px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 active:scale-95"
        >
           {loading ? <Loader2 className="animate-spin mx-auto" /> : `Authorize ${reward} RC Reward`}
        </button>

        <div className="mt-8 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20">Authorized Terminal Session • Dispatcher Sync</p>
        </div>
      </div>
    </div>
  );
};