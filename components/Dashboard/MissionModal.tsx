
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { X, MapPin, Link as LinkIcon, CheckCircle2, ShieldCheck, Loader2, Building2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    const checkStatus = async () => {
      if (!supabase || !mission.id || !user.uid) return;
      try {
        const { data } = await supabase
          .from('submissions')
          .select('*')
          .eq('mission_id', mission.id)
          .eq('user_id', user.uid)
          .maybeSingle();
        if (data) {
          setExistingSubmission(data);
          setLink(data.link || '');
        }
      } catch (err) {
        console.error("STATUS_CHECK_FAILED:", err);
      } finally {
        setInitialFetchLoading(false);
      }
    };
    checkStatus();
  }, [mission.id, user.uid]);

  const brand = mission.partner_brands;
  const checkpoints = mission.checkpoints && mission.checkpoints.length > 0 
    ? mission.checkpoints 
    : ["Tag @Reelywood in caption", "Use brand hashtags", "Ensure high visual fidelity"];

  const handleSubmit = async () => {
    if (!link) return alert("Please paste your content link first.");
    if (!supabase) return;
    setLoading(true);
    try {
      await supabase.from('submissions').insert([{
        mission_id: mission.id, user_id: user.uid, link: link, status: 'pending', checklist_state: [false, false, false]
      }]);
      const { data } = await supabase.from('submissions').select('*').eq('mission_id', mission.id).eq('user_id', user.uid).single();
      setExistingSubmission(data);
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = existingSubmission?.status;
  const isApproved = status === 'approved' || status === 'completed';
  const isPending = status === 'pending' || status === 'verifying';

  return (
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[100svh] md:h-auto md:max-h-[85vh] overflow-y-auto md:border-[6px] border-black md:shadow-[16px_16px_0px_0px_#834bf1] relative flex flex-col md:flex-row animate-in slide-in-from-bottom md:zoom-in-95 duration-500">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black text-white p-3 border-2 border-white rounded-full md:rounded-none md:shadow-[3px_3px_0px_0px_#000] active:scale-90 transition-all">
          <X size={20} strokeWidth={4} />
        </button>

        {/* LEFT: BRAND INTEL */}
        <div className="w-full md:w-5/12 relative bg-black md:border-r-[6px] border-black overflow-hidden group min-h-[240px] md:min-h-[400px]">
           <img 
              src={brand?.cover_image_url || mission.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
              className="w-full h-full object-cover opacity-70" 
              alt="Mission cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
           
           <div className="absolute top-6 left-6 w-14 h-14 md:w-20 md:h-20 bg-white border-[3px] border-black p-2 shadow-[4px_4px_0px_0px_#000] z-20">
              {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Building2 className="w-full h-full text-black" />}
           </div>

           <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full space-y-4 z-10">
              <div className="inline-block bg-[#ffde59] text-black font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] px-3 py-1.5 border-[2px] border-black">
                 {brand?.name || "REELYWOOD"}
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase font-display tracking-tighter leading-none text-white">{mission.title}</h2>
              <a href={brand?.map_link} target="_blank" rel="noreferrer" className="flex items-center space-x-2 font-black text-[10px] text-gray-300 uppercase tracking-widest active:text-[#ffde59]">
                 <MapPin size={12} strokeWidth={3} className="text-[#ffde59]" /> 
                 <span>{mission.location || brand?.location_text || "Global"}</span>
              </a>
           </div>
        </div>

        {/* RIGHT: OPERATION CONSOLE */}
        <div className="w-full md:w-7/12 p-6 md:p-12 flex flex-col bg-white">
           <div className="flex-1 space-y-8 md:space-y-12">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <h3 className="font-black text-xl md:text-3xl uppercase italic font-display">Mission Brief</h3>
                    <p className="text-[8px] font-black text-black/30 uppercase tracking-widest">Auth: {user.uid.slice(0,8)}</p>
                 </div>
                 <div className="bg-black text-white p-4 md:p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] text-center min-w-[100px]">
                    <div className="text-2xl md:text-4xl font-black italic font-display">{mission.reward_amount || 0}</div>
                    <div className="text-[8px] font-black uppercase text-[#ffde59]">RC BOUNTY</div>
                 </div>
              </div>

              {initialFetchLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#834bf1]" size={32} /></div>
              ) : (
                <div className="space-y-6">
                  <div className={`border-[3px] p-5 relative shadow-[4px_4px_0px_0px] transition-all ${isApproved ? 'bg-emerald-50 border-emerald-500 shadow-emerald-100' : isPending ? 'bg-yellow-50 border-yellow-500 shadow-yellow-100' : 'bg-slate-50 border-black shadow-black'}`}>
                    <ul className="space-y-4">
                        {checkpoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className="w-7 h-7 bg-white border-[2px] border-black flex items-center justify-center font-black text-[10px] italic shrink-0">
                                {i+1}
                            </div>
                            <span className="font-black text-[11px] uppercase leading-tight text-black/70 pt-1">{pt}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <p className="text-[11px] font-bold text-black/60 uppercase leading-relaxed border-l-4 border-[#834bf1] pl-4">
                      {mission.description || 'Deliver high-fidelity visual strategy as per brand identity standards.'}
                  </p>
                </div>
              )}
           </div>

           <div className="mt-8 pt-8 border-t-[3px] border-black pb-6">
              {initialFetchLoading ? null : !!existingSubmission ? (
                <div className={`border-[3px] border-black p-6 text-center shadow-[4px_4px_0px_0px_#000] ${isApproved ? 'bg-[#39ff14]' : 'bg-yellow-400'}`}>
                   {isApproved ? <CheckCircle2 size={32} className="mx-auto mb-2" strokeWidth={3}/> : <Loader2 className="animate-spin mx-auto mb-2" size={32} strokeWidth={3}/>}
                   <h3 className="font-black text-lg uppercase italic font-display">
                     {isApproved ? 'TRANSMISSION OK' : 'SYNCING SIGNAL'}
                   </h3>
                   <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-center gap-2">
                      <LinkIcon size={10} strokeWidth={3}/>
                      <span className="text-[8px] font-black underline truncate max-w-[200px]">{link}</span>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 italic">Link Evidence (IG Reel/Story)</label>
                    <div className="flex items-center border-[3px] border-black focus-within:shadow-[4px_4px_0px_0px_#834bf1] transition-all bg-white overflow-hidden">
                       <input 
                         type="text" 
                         className="w-full p-4 font-black text-xs outline-none placeholder:text-black/20"
                         placeholder="https://instagram.com/reel/..."
                         value={link}
                         onChange={(e) => setLink(e.target.value)}
                       />
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !link}
                    className="w-full bg-black text-white py-5 font-black uppercase text-xs tracking-[0.2em] border-[3px] border-black active:scale-95 shadow-[4px_4px_0px_0px_#834bf1] active:shadow-none transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <LinkIcon size={16} strokeWidth={3} />}
                    <span>Submit Protocol</span>
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
