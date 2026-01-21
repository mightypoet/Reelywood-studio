
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { 
  X, MapPin, Link as LinkIcon, CheckCircle2, 
  ShieldCheck, Loader2, Building2, AlertCircle, 
  Clock, Zap, Camera, Share2, Info
} from 'lucide-react';

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

  // ROBUST IMAGE LOGIC
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1614726365723-49cfae927832?q=80&w=2574&auto=format&fit=crop';
  const coverImage = mission.cover_url || mission.image_url || mission.banner_url || FALLBACK_IMAGE;

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
    : ["Produce high-quality visual content", "Tag @Reelywood and the partner brand", "Ensure link is public and accessible"];

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
      
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('mission_id', mission.id)
        .eq('user_id', user.uid)
        .single();
      setExistingSubmission(data);
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = !!existingSubmission;
  const status = existingSubmission?.status;
  const isApproved = status === 'approved' || status === 'completed';

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300">
      {/* Backdrop for desktop click-to-close */}
      <div className="absolute inset-0 hidden sm:block" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] border-t-[5px] sm:border-[5px] border-black shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-[16px_16px_0px_0px_#000] relative flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 rounded-t-[2.5rem] sm:rounded-none">
        
        {/* Mobile Handle */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-black/10 rounded-full" />
        </div>

        {/* STICKY HEADER */}
        <header className="sticky top-0 z-50 bg-white border-b-[4px] border-black px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border-[3px] border-black p-1 shadow-[3px_3px_0px_0px_#000] shrink-0">
              {brand?.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-full h-full text-black" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black uppercase italic leading-tight truncate">{brand?.name || "MISSION_NODE"}</h2>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-black/40 uppercase tracking-widest">
                <ShieldCheck size={10} className="text-emerald-500" /> Authorized Operation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black text-[#ffde59] px-3 py-1.5 border-[2px] border-black text-[10px] font-black italic shadow-[2px_2px_0px_0px_#834bf1]">
              +{mission.reward_amount || 0} RC
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#ffde59] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <X size={20} strokeWidth={4} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#fdfdfd]">
          {/* HERO IMAGE SECTION */}
          <div className="relative w-full h-48 sm:h-64 md:h-72 border-b-[4px] border-black overflow-hidden bg-slate-100">
             <img 
               src={coverImage} 
               alt="Mission Visual" 
               className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
               }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-block bg-[#834bf1] text-white font-black text-[9px] uppercase tracking-[0.4em] px-3 py-1 border-[2px] border-black mb-2">
                  Deployment Briefing
                </div>
                <h1 className="text-3xl sm:text-5xl font-black italic uppercase font-display leading-[0.9] tracking-tighter text-white drop-shadow-[2px_2px_0px_#000]">
                  {mission.title}
                </h1>
             </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-black/50 uppercase tracking-widest italic">
              <MapPin size={12} className="text-[#834bf1]" strokeWidth={3} />
              {mission.location || brand?.location_text || "Global Node"}
            </div>

            {/* Classification Stamp */}
            <div className="relative py-4">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none rotate-[-12deg] z-0">
                 <span className="text-8xl font-black uppercase font-display border-[12px] border-black px-8 py-2">CLASSIFIED</span>
              </div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-black/30">
                  <Info size={14} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Operational Intel</span>
                </div>
                <p className="text-base font-bold text-black/80 leading-relaxed border-l-[6px] border-[#ffde59] pl-6 italic">
                  {mission.description || "Initialize brand-aligned content production. Ensure lighting and framing adhere to studio high-fidelity standards."}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-black">
                <ListIcon className="text-[#834bf1]" size={16} strokeWidth={3} />
                Execution Checklist
              </h3>
              <div className="grid gap-3">
                {checkpoints.map((pt, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                    <div className="w-8 h-8 bg-slate-50 border-2 border-black flex items-center justify-center shrink-0">
                      {i === 0 ? <Camera size={14} /> : i === 1 ? <Share2 size={14} /> : <Zap size={14} />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-black/70">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spacer for sticky footer on mobile */}
          <div className="h-24 sm:h-0" />
        </main>

        {/* STICKY ACTION FOOTER */}
        <footer className="sticky bottom-0 z-50 bg-white border-t-[4px] border-black p-6 pb-8 sm:pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          {initialFetchLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-[#834bf1]" />
            </div>
          ) : isSubmitted ? (
            <div className={`p-5 flex items-center justify-between gap-4 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] animate-in zoom-in duration-300 ${isApproved ? 'bg-[#39ff14]' : 'bg-[#ffde59]'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-white border-[2px] border-black flex items-center justify-center shrink-0">
                  {isApproved ? <CheckCircle2 className="text-emerald-600" strokeWidth={3} /> : <Clock className="animate-pulse" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase italic leading-none text-black">{isApproved ? 'Bounty Credited' : 'Review in Progress'}</p>
                  <p className="text-[9px] font-bold opacity-50 uppercase truncate mt-1 text-black">{link}</p>
                </div>
              </div>
              <div className="bg-black text-white px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border-2 border-white">
                {status}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
                    <LinkIcon size={18} strokeWidth={3} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="PASTE REEL / STORY LINK..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#f4f4f4] border-[3px] border-black font-black text-[11px] uppercase tracking-widest focus:bg-white focus:outline-none focus:ring-0 transition-all shadow-[4px_4px_0px_0px_#000] focus:shadow-none placeholder:text-black/20 text-black"
                  />
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !link}
                  className={`w-full sm:w-auto px-8 py-4 border-[3px] border-black font-black uppercase text-xs tracking-[0.2em] shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale ${loading ? 'bg-slate-200' : 'bg-[#834bf1] text-white hover:bg-[#7239e2]'}`}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                  <span>Initialize Submission</span>
                </button>
              </div>
              <p className="text-center text-[7px] font-black uppercase tracking-[0.5em] text-black/30">
                Authorized Personnel Sync • Production v4.5.1
              </p>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

// Internal icon proxy for local ref
const ListIcon = ({ className, size, strokeWidth }: { className?: string, size?: number, strokeWidth?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth || 2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);
