import React, { useState } from 'react';
import { supabase } from '../../lib/clients';
import { X, MapPin, Link as LinkIcon, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface MissionModalProps {
  mission: any;
  user: any;
  onClose: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ mission, user, onClose }) => {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const checkpoints = mission.checkpoints && mission.checkpoints.length > 0 
    ? mission.checkpoints 
    : ["Tag @Reelywood in caption", "Use brand hashtags", "Ensure high visual fidelity"];

  const handleSubmit = async () => {
    if (!link) return alert("Please paste your content link first.");
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
      setSubmitted(true);
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[85vh] overflow-y-auto border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] relative flex flex-col md:flex-row animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-black text-white p-3 border-2 border-white hover:rotate-90 transition-transform shadow-[4px_4px_0px_0px_#000]">
          <X size={24} strokeWidth={4} />
        </button>

        {/* LEFT: BRAND INTEL */}
        <div className="w-full md:w-5/12 relative bg-black border-r-[6px] border-black overflow-hidden group">
           <img 
              src={mission.partner_brands?.cover_image_url || mission.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-1000" 
              alt="Mission cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
           
           <div className="absolute bottom-0 left-0 p-10 w-full space-y-6">
              <div className="inline-block bg-[#ffde59] text-black font-black text-[10px] uppercase tracking-[0.4em] px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                 PROTOCOL: {mission.partner_brands?.name || "REELYWOOD"}
              </div>
              <h2 className="text-5xl font-black italic uppercase font-display tracking-tighter leading-none text-white drop-shadow-lg">{mission.title}</h2>
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.location || mission.partner_brands?.location_text || "Kolkata")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-3 font-black text-xs text-gray-300 uppercase tracking-widest hover:text-[#ffde59] hover:underline transition-all cursor-pointer group/loc"
              >
                 <MapPin size={16} strokeWidth={3} className="text-[#ffde59] group-hover/loc:scale-110 transition-transform" /> 
                 <span>{mission.location || mission.partner_brands?.location_text || "Global Sync"} (View Map)</span>
              </a>
           </div>
        </div>

        {/* RIGHT: OPERATION CONSOLE */}
        <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col bg-white">
           <div className="flex-1 space-y-12">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <h3 className="font-black text-3xl uppercase italic tracking-tighter font-display">Operational Brief</h3>
                    <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em]">Authorization: {user.uid.slice(0,10)}...</p>
                 </div>
                 <div className="bg-black text-white p-6 border-[4px] border-black shadow-[6px_6px_0px_0px_#834bf1] text-center min-w-[120px]">
                    <div className="text-4xl font-black italic font-display">{mission.reward_amount || 0}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#ffde59]">Bounty (RC)</div>
                 </div>
              </div>

              <div className="bg-slate-50 border-[4px] border-black p-8 relative shadow-[8px_8px_0px_0px_#000]">
                 <div className="absolute -top-4 left-6 bg-white px-4 py-1 border-[3px] border-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} strokeWidth={3} className="text-emerald-500"/> Deployment Checkpoints
                 </div>
                 <ul className="space-y-6 mt-4">
                    {checkpoints.map((pt, i) => (
                      <li key={i} className="flex items-center gap-6">
                         <div className="w-10 h-10 bg-white border-[3px] border-black flex items-center justify-center font-black text-sm italic shadow-[3px_3px_0px_0px_#000]">
                            {i+1}
                         </div>
                         <span className="font-black text-xs uppercase tracking-tight leading-tight text-black/70">{pt}</span>
                      </li>
                    ))}
                 </ul>
              </div>

              <div className="space-y-4">
                 <p className="text-xs font-black uppercase text-black/40 italic">Intelligence Package:</p>
                 <p className="text-sm font-bold text-black/60 uppercase leading-relaxed border-l-4 border-[#834bf1] pl-6">
                    {mission.description}
                 </p>
              </div>
           </div>

           {/* SUBMISSION AREA */}
           <div className="mt-12 pt-10 border-t-[4px] border-black">
              {submitted ? (
                <div className="bg-[#39ff14] border-[4px] border-black p-8 text-center animate-in zoom-in duration-300 shadow-[8px_8px_0px_0px_#000]">
                   <CheckCircle2 size={48} className="mx-auto mb-4" strokeWidth={3}/>
                   <h3 className="font-black text-2xl uppercase italic font-display">Transmission Syncing</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manual Verification Queue Initialized</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 italic">Paste Content Evidence (Instagram Reel / Story Link)</label>
                    <div className="flex items-center border-[4px] border-black focus-within:shadow-[6px_6px_0px_0px_#834bf1] transition-all bg-white overflow-hidden">
                       <div className="bg-slate-50 p-5 border-r-[4px] border-black text-black/40">
                          <LinkIcon size={24} strokeWidth={3} />
                       </div>
                       <input 
                         type="text" 
                         className="w-full p-5 font-black text-sm outline-none placeholder:text-black/20"
                         placeholder="https://instagram.com/reel/..."
                         value={link}
                         onChange={(e) => setLink(e.target.value)}
                       />
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !link}
                    className="w-full bg-black text-white py-6 font-black uppercase text-sm tracking-[0.4em] border-[4px] border-black hover:bg-[#ffde59] hover:text-black shadow-[8px_8px_0px_0px_#834bf1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <LinkIcon size={20} strokeWidth={3} />}
                    <span>Initialize Submission</span>
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};