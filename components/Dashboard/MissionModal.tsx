import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { X, MapPin, Link as LinkIcon, CheckCircle2, ShieldCheck, Loader2, Building2, Clock } from 'lucide-react';

interface MissionModalProps {
  mission: any;
  user: any;
  onClose: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ mission, user, onClose }) => {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);

  // --- AUTO REFRESH LISTENER (MODAL SPECIFIC) ---
  useEffect(() => {
    if (!supabase || !mission.id || !user.uid) return;

    // 1. Initial Fetch
    const checkStatus = async () => {
      try {
        const { data } = await supabase!.from('submissions')
          .select('*').eq('mission_id', mission.id).eq('user_id', user.uid).maybeSingle();
        if (data) { 
          setExistingSubmission(data); 
          setLink(data.link || ''); 
        }
      } catch (err) { console.error("Sync Check Failed", err); } 
      finally { setInitialFetchLoading(false); }
    };
    checkStatus();

    // 2. Real-Time Listener for THIS specific mission submission
    const channel = supabase!.channel(`mission-status-${mission.id}-${user.uid}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'submissions', filter: `mission_id=eq.${mission.id}` }, 
        (payload) => {
             // Validate user_id to ensure we only catch our own changes
             if (payload.new && (payload.new as any).user_id === user.uid) {
                 setExistingSubmission(payload.new);
             }
        }
      )
      .subscribe();

    return () => { supabase!.removeChannel(channel); };
  }, [mission.id, user.uid]);

  const brand = mission.partner_brands;
  const checkpoints = mission.checkpoints || ["Tag @Reelywood in caption", "High Visual Fidelity", "Use Official Sound"];

  const handleSubmit = async () => {
    if (!link) return alert("Please input transmission link.");
    if (!supabase) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('submissions').insert([{
        mission_id: mission.id,
        user_id: user.uid,
        link: link,
        status: 'pending',
        checklist_state: [false, false, false]
      }]);
      if (error) throw error;
      // Real-time listener handles the state transition automatically
    } catch (err: any) { alert("Deployment Error: " + err.message); } 
    finally { setLoading(false); }
  };

  const isSubmitted = !!existingSubmission;
  const status = existingSubmission?.status;
  const isApproved = status === 'approved' || status === 'completed';
  const isPending = status === 'pending' || status === 'verifying';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl md:h-auto md:max-h-[85vh] overflow-y-auto border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] relative flex flex-col md:flex-row animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-black text-white p-3 border-2 border-white hover:rotate-90 transition-transform shadow-[4px_4px_0px_0px_#000]">
          <X size={24} strokeWidth={4} />
        </button>

        {/* LEFT PANEL: BRAND ASSETS */}
        <div className="w-full md:w-5/12 relative bg-black min-h-[350px] border-r-[6px] border-black group overflow-hidden">
           <img 
             src={brand?.cover_image_url || mission.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
             className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" 
             alt="Brand assets"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
           
           <div className="absolute top-10 left-10 w-20 h-20 bg-white border-[4px] border-black p-3 shadow-[6px_6px_0px_0px_#000] z-20">
              {brand?.logo_url ? <img src={brand.logo_url} className="w-full h-full object-contain" alt="Logo" /> : <Building2 className="w-full h-full text-black"/>}
           </div>

           <div className="absolute bottom-0 left-0 p-10 space-y-6 z-10 w-full">
              <div className="inline-block bg-[#ffde59] text-black font-black text-[10px] uppercase tracking-[0.4em] px-4 py-2 border-[3px] border-black">
                 PROTOCOL: {brand?.name || "ALLIANCE"}
              </div>
              <h2 className="text-5xl font-black italic uppercase font-display text-white leading-none tracking-tighter drop-shadow-xl">{mission.title}</h2>
              <div className="flex items-center gap-2 font-black text-xs uppercase text-gray-300 tracking-widest italic">
                 <MapPin size={16} className="text-[#ffde59]" strokeWidth={3}/> {mission.location || "GLOBAL SYNC"}
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: CONSOLE */}
        <div className="w-full md:w-7/12 p-10 md:p-14 bg-white flex flex-col">
           <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                 <h3 className="text-3xl font-black uppercase italic font-display tracking-tight text-black">Mission Briefing</h3>
                 <p className="text-[10px] font-black uppercase text-black/30 tracking-[0.4em]">AUTHORIZED NODE: {user.uid.slice(0,12)}</p>
              </div>
              <div className="bg-black text-white p-6 border-[4px] border-black shadow-[6px_6px_0px_0px_#834bf1] text-center min-w-[130px]">
                 <div className="text-4xl font-black italic font-display leading-none">{mission.reward_amount}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest mt-2 text-[#ffde59]">Bounty (RC)</div>
              </div>
           </div>

           {initialFetchLoading ? <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-[#834bf1] mb-4" size={32}/><p className="text-[10px] font-black uppercase tracking-widest opacity-30">Retrieving encrypted data...</p></div> : (
             <div className="space-y-10 flex-1">
               <div className={`p-8 border-[4px] transition-colors duration-500 relative shadow-[8px_8px_0px_0px] ${isApproved ? 'bg-emerald-50 border-emerald-500 shadow-emerald-200' : isPending ? 'bg-yellow-50 border-yellow-500 shadow-yellow-200' : 'bg-slate-50 border-black shadow-black'}`}>
                  <div className={`absolute -top-4 left-6 px-4 py-1 border-[3px] border-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${isApproved ? 'bg-emerald-500 text-white' : isPending ? 'bg-yellow-400 text-black' : 'bg-white text-black'}`}>
                     {isApproved ? <CheckCircle2 size={14} /> : isPending ? <Clock size={14} /> : <ShieldCheck size={14} className="text-[#834bf1]"/>}
                     {isApproved ? 'VERIFIED' : isPending ? 'IN REVIEW' : 'REQUIREMENTS'}
                  </div>
                  <ul className="space-y-4">
                     {checkpoints.map((pt:string, i:number) => (
                       <li key={i} className="flex items-center gap-6">
                         <span className="w-10 h-10 bg-white border-[3px] border-black flex items-center justify-center font-black text-sm italic shadow-[3px_3px_0px_0px_#000] text-black">{i+1}</span>
                         <span className="text-xs font-black uppercase opacity-70 tracking-tight leading-none text-black">{pt}</span>
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-4">
                  <p className="text-xs font-black uppercase text-black/40 italic">Intelligence Package:</p>
                  <p className="text-sm font-bold uppercase leading-relaxed text-black/60 border-l-4 border-[#834bf1] pl-6 py-1">
                     {mission.description || "Deploy visual assets across authorized social nodes. Ensure brand fidelity meets high-performance standards for narrative consistency."}
                  </p>
               </div>

               {/* SUBMISSION FORM CONSOLE */}
               <div className="mt-auto pt-10 border-t-[4px] border-black">
                  {!isSubmitted ? (
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase opacity-40 italic tracking-widest text-black">Input Proof of Work (Link)</label>
                          <div className="flex border-[4px] border-black bg-white overflow-hidden focus-within:shadow-[6px_6px_0px_0px_#834bf1] transition-all">
                             <div className="bg-slate-50 p-5 border-r-[4px] border-black text-black/40">
                                <LinkIcon size={24} strokeWidth={3} />
                             </div>
                             <input 
                               className="w-full p-5 font-black text-sm outline-none placeholder:opacity-20 text-black"
                               placeholder="https://instagram.com/reel/..."
                               value={link} onChange={e => setLink(e.target.value)} disabled={loading}
                             />
                          </div>
                       </div>
                       <button 
                         onClick={handleSubmit} disabled={loading || !link}
                         className="w-full py-6 bg-black text-white font-black uppercase text-sm border-[4px] border-black hover:bg-[#ffde59] hover:text-black shadow-[8px_8px_0px_0px_#834bf1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                       >
                         {loading ? <Loader2 className="animate-spin" size={24}/> : <ShieldCheck size={24} strokeWidth={3}/>}
                         <span>{loading ? 'DEPLOYING...' : 'INITIATE VERIFICATION'}</span>
                       </button>
                    </div>
                  ) : (
                    <div className={`border-[4px] border-black p-10 text-center animate-in zoom-in duration-500 shadow-[10px_10px_0px_0px_#000] ${isApproved ? 'bg-[#39ff14]' : 'bg-yellow-400'}`}>
                       {isApproved ? <CheckCircle2 size={56} className="mx-auto mb-6 text-black" strokeWidth={3}/> : <Loader2 className="animate-spin mx-auto mb-6 text-black" size={56} strokeWidth={3}/>}
                       <h4 className="text-3xl font-black uppercase italic font-display leading-none mb-4 text-black">
                         {isApproved ? 'SIGNAL VERIFIED' : 'TRANSMISSION SYNCING'}
                       </h4>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 text-black">
                         {isApproved ? 'Asset ledger updated: Rewards credited' : 'Manual verification queue initialized'}
                       </p>
                       <div className="mt-8 pt-4 border-t-2 border-black/10 flex items-center justify-center gap-3 text-black">
                          <LinkIcon size={14} strokeWidth={3} className="opacity-40 text-black"/>
                          <span className="text-[10px] font-black underline truncate max-w-xs opacity-60 tracking-tighter text-black">{link}</span>
                       </div>
                    </div>
                  )}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};