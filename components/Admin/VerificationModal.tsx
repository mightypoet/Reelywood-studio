
import React, { useState, useMemo } from 'react';
import { supabase } from '../../lib/clients';
import { Check, X, ExternalLink, ShieldCheck, Loader2, Zap, Coins, AlertCircle } from 'lucide-react';

interface VerificationModalProps {
  submission: any;
  onClose: () => void;
  onRefresh: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ submission, onClose, onRefresh }) => {
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const missionData = useMemo(() => submission?.missions || submission?.mission, [submission]);
  const allocatedRC = useMemo(() => missionData?.reward_amount ?? 0, [missionData]);

  const checkpoints = useMemo(() => {
    return missionData?.checkpoints && missionData.checkpoints.length >= 1 
      ? missionData.checkpoints 
      : ["Verify Link Authority", "Quality Control Check", "Tag/Caption Audit"];
  }, [missionData]);
  
  const missionTitle = missionData?.title || "UNSPECIFIED MISSION";
  const agentName = submission?.profiles?.display_name || "AGENT";

  const toggleCheck = (index: number) => {
    const newChecks = [...checks];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
  };

  const handleExecuteVerification = async () => {
    if (checks.some(c => !c)) {
       alert("⚠️ PROTOCOL VIOLATION: Quality Control factors must be fully verified before reward distribution.");
       return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Database terminal unavailable.");

      // 1. Fetch Brand Wallet Balance
      const { data: brand, error: bError } = await supabase
        .from('partner_brands')
        .select('id, reelcoins, name')
        .eq('id', missionData.brand_id)
        .single();
      
      if (bError) throw bError;

      // 2. Check for Insufficient Funds
      if ((brand.reelcoins || 0) < allocatedRC) {
        alert(`⛔ INSUFFICIENT BRAND FUNDS: ${brand.name} only has ${brand.reelcoins} RC. Mission requires ${allocatedRC} RC.`);
        setLoading(false);
        return;
      }

      // 3. Deduct from Brand
      const { error: deductError } = await supabase
        .from('partner_brands')
        .update({ reelcoins: brand.reelcoins - allocatedRC })
        .eq('id', brand.id);
      
      if (deductError) throw deductError;

      // 4. Credit User and mark as approved via RPC or direct updates
      // Using existing RPC logic which should handle user credit and submission status
      const { data, error } = await supabase.rpc('grant_mission_reward', {
         amount_param: allocatedRC,
         mission_title_param: missionTitle,
         submission_id_param: submission.id,
         user_id_param: submission.user_id 
      });

      if (error) {
        // Rollback brand deduction on failure (simplified)
        await supabase.from('partner_brands').update({ reelcoins: brand.reelcoins }).eq('id', brand.id);
        throw error;
      }

      if (data && data.success === false) {
        throw new Error(data.message || "Unknown Backend Error");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onRefresh(); 
        onClose();   
      }, 2000);
      
    } catch (err: any) {
      console.error("DISTRIBUTION_FAILURE:", err);
      alert("Terminal Critical Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg border-[6px] border-black shadow-[24px_24px_0px_0px_#4ade80] p-8 md:p-12 relative overflow-hidden">
        
        {isSuccess ? (
          <div className="py-20 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-[#4ade80] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mx-auto flex items-center justify-center -rotate-6">
              <Coins size={48} className="text-black" strokeWidth={3} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic uppercase font-display leading-none">Signal Verified</h2>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">
                +{allocatedRC} RC Transferred to {agentName}
              </p>
            </div>
            <div className="bg-black text-white p-4 border-[3px] border-white font-black text-[10px] uppercase tracking-widest animate-pulse">
              SYNCING GLOBAL LEDGER...
            </div>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-6 right-6 z-10 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors shadow-[4px_4px_0px_0px_#000]">
               <X size={20} strokeWidth={3} />
            </button>

            <div className="space-y-2 mb-10">
              <div className="bg-[#834bf1] text-white px-3 py-1 border-[2px] border-black inline-block text-[8px] font-black uppercase tracking-widest mb-2">
                Mission Validation Phase
              </div>
              <h2 className="text-3xl font-black italic uppercase font-display tracking-tighter text-black leading-tight">Verify Deployment</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 italic flex items-center gap-2">
                <ShieldCheck size={14} strokeWidth={3} className="text-[#834bf1]" /> Admin Authority Required
              </p>
            </div>

            <div className="bg-slate-50 border-[3px] border-black p-6 mb-8 relative">
               <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 border-white shadow-[3px_3px_0px_0px_#000]">
                 Content Evidence
               </div>
               <div className="flex justify-between items-center gap-4 mt-2">
                   <a href={submission.link} target="_blank" rel="noreferrer" className="truncate font-black text-sm text-[#834bf1] underline italic hover:text-black transition-colors">
                      {submission.link}
                   </a>
                   <a href={submission.link} target="_blank" rel="noreferrer" className="bg-[#ffde59] border-[3px] border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 active:scale-95">
                      <ExternalLink size={20} strokeWidth={3} />
                   </a>
               </div>
            </div>

            <div className="space-y-4 mb-10">
               <p className="font-black text-[10px] uppercase tracking-[0.4em] text-black/30 italic mb-4">Verification Factors:</p>
               {checkpoints.map((pt: string, i: number) => (
                  <div key={i} 
                       onClick={() => toggleCheck(i)}
                       className={`p-5 border-[3px] cursor-pointer flex items-center gap-5 transition-all active:scale-[0.98] ${checks[i] ? 'bg-[#4ade80] border-black shadow-[6px_6px_0px_0px_#000]' : 'bg-white border-slate-200 hover:border-black'}`}>
                     <div className={`w-8 h-8 border-[3px] border-black flex items-center justify-center shrink-0 ${checks[i] ? 'bg-black text-white' : 'bg-white'}`}>
                        {checks[i] && <Check size={20} strokeWidth={4} />}
                     </div>
                     <span className="font-black text-xs uppercase tracking-tight leading-none">{pt}</span>
                  </div>
               ))}
            </div>

            <button 
               onClick={handleExecuteVerification}
               disabled={loading}
               className="w-full group bg-black text-white py-6 font-black uppercase text-sm tracking-[0.4em] border-[4px] border-black hover:bg-[#ffde59] hover:text-black shadow-[8px_8px_0px_0px_#834bf1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-4"
            >
               {loading ? <Loader2 className="animate-spin" /> : (
                 <>
                   <Zap size={20} className="group-hover:text-[#834bf1] fill-current" />
                   <span>Authorize {allocatedRC} RC Reward</span>
                 </>
               )}
            </button>

            <div className="mt-8 text-center">
               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 italic">
                 Security Sequence: Status(Approved) {"->"} BrandDeduct({allocatedRC}) {"->"} UserCredit({allocatedRC})
               </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
