
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { 
  X, MapPin, Link as LinkIcon, CheckCircle2, 
  ShieldCheck, Loader2, Building2, AlertCircle, 
  Clock, Zap, Camera, Share2, Info, ExternalLink
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

  const missionAddress = mission.location || brand?.location_text || "Global Node";
  const mapLink = mission.map_link || brand?.map_link;

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300">
      <div className="absolute inset-0 hidden sm:block" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] border-t-[5px] sm:border-[5px] border-black shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-[16px_16px_0px_0px_#000] relative flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 rounded-t-[2.5rem] sm:rounded-none">
        
        {/* Header - Styled to match screenshot */}
        <header className="bg-white border-b-[4px] border-black px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-[3px] border-black p-1 shadow-[2px_2px_0px_0px_#000] shrink-0">
              {brand?.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-full h-full text-black" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black uppercase italic leading-tight text-black">{brand?.name || "MISSION_NODE"}</h2>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mt-0.5">
                <ShieldCheck size={10} className="text-emerald-500" /> Authorized Operation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-black text-[#ffde59] px-5 py-2.5 border-[3px] border-black font-black italic text-xs tracking-widest shadow-[3px_3px_0px_0px_#834bf1]">
              +{mission.reward_amount || 0} RC
            </div>
            <button 
              onClick={onClose} 
              className="w-11 h-11 flex items-center justify-center bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition-all"
            >
              <X size={24} strokeWidth={4} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#fdfdfd]">
          {/* Hero Section */}
          <div className="relative w-full h-64 sm:h-96 border-b-[4px] border-black overflow-hidden bg-slate-200">
             <img 
               src={coverImage} 
               alt="Mission Visual" 
               className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
               }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
             <div className="absolute bottom-10 left-10 right-10">
                <div className="inline-block bg-[#834bf1] text-white font-black text-[10px] uppercase tracking-[0.4em] px-4 py-1.5 border-[3px] border-black mb-4 shadow-[4px_4px_0px_0px_#000]">
                  Deployment Briefing
                </div>
                <h1 className="text-5xl sm:text-7xl font-black italic uppercase font-display leading-[0.8] tracking-tighter text-white drop-shadow-[4px_4px_0px_#000]">
                  {mission.title}
                </h1>
             </div>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            {/* Address with Underline from Screenshot */}
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-[#834bf1] mt-1 shrink-0" strokeWidth={3} />
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block italic">Operational Venue</span>
                {mapLink ? (
                  <a 
                    href={mapLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-base sm:text-lg font-black text-black border-b-[4px] border-[#ffde59] hover:text-[#834bf1] hover:border-[#834bf1] transition-all flex items-center gap-3 w-fit"
                  >
                    {missionAddress}
                    <ExternalLink size={16} strokeWidth={3} />
                  </a>
                ) : (
                  <span className="text-base sm:text-lg font-black text-black uppercase tracking-tight italic border-b-[4px] border-[#ffde59]">{missionAddress}</span>
                )}
              </div>
            </div>

            {/* Operational Intel Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-black/30">
                <Info size={16} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Intel</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-black leading-tight border-l-[10px] border-[#ffde59] pl-8 py-2 italic uppercase bg-slate-50 shadow-inner">
                {mission.description || "Initialize brand-aligned content production. Ensure lighting and framing adhere to studio standards."}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-black">
                <div className="w-1.5 h-1.5 bg-[#834bf1] rotate-45" />
                Execution Checklist
              </h3>
              <div className="grid gap-6">
                {checkpoints.map((pt: string, i: number) => (
                  <div key={i} className="flex items-center gap-5 bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-slate-50 border-[3px] border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#ffde59]">
                      {i === 0 ? <Camera size={24} /> : i === 1 ? <Share2 size={24} /> : <Zap size={24} />}
                    </div>
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-black leading-none">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-40 sm:h-0" />
        </main>

        {/* Footer - Styled as the Yellow Banner in screenshot */}
        <footer className="sticky bottom-0 z-50 bg-white border-t-[5px] border-black p-6 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]">
          {initialFetchLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-[#834bf1]" />
            </div>
          ) : isSubmitted ? (
            <div className="bg-[#ffde59] border-[5px] border-black p-6 flex items-center justify-between shadow-[8px_8px_0px_0px_#000] animate-in slide-in-from-bottom duration-500">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                    {isApproved ? <CheckCircle2 size={32} className="text-emerald-600" strokeWidth={4} /> : <Clock size={32} className="animate-pulse" strokeWidth={3} />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black uppercase italic font-display leading-none text-black">
                      {isApproved ? 'BOUNTY AUTHORIZED' : 'REVIEW IN PROGRESS'}
                    </h4>
                    <p className="text-[10px] font-black tracking-widest text-black/50 truncate max-w-[200px]">{link}</p>
                  </div>
               </div>
               <div className="bg-black text-white px-5 py-2.5 font-black uppercase text-[10px] tracking-widest border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                  {status?.toUpperCase() || 'CACHED'}
               </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30">
                    <LinkIcon size={20} strokeWidth={3} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="PASTE REEL / STORY LINK..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-[#f8f8f8] border-[4px] border-black font-black text-xs uppercase tracking-[0.2em] focus:bg-white focus:outline-none transition-all shadow-[6px_6px_0px_0px_#000] focus:shadow-none placeholder:text-black/20 text-black"
                  />
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !link}
                  className={`w-full sm:w-auto px-12 py-5 border-[4px] border-black font-black uppercase text-xs tracking-[0.3em] shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:grayscale ${loading ? 'bg-slate-100' : 'bg-[#834bf1] text-white hover:bg-[#7239e2]'}`}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                  <span>TRANSMIT LOG</span>
                </button>
              </div>
              <p className="text-center text-[8px] font-black uppercase tracking-[0.6em] text-black/20">
                PERSONNEL SYNC v4.5.1 • AUTHENTICATED
              </p>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};
