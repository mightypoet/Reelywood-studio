
import React, { useState } from 'react';
import { X, Target, Users, MapPin, Zap, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface TargetingModalProps {
  item: any;
  type: 'mission' | 'reward';
  isApproving: boolean;
  onClose: () => void;
  onConfirm: (targetingData: any) => void;
  loading?: boolean;
}

export const TargetingModal: React.FC<TargetingModalProps> = ({ 
  item, 
  type, 
  isApproving, 
  onClose, 
  onConfirm,
  loading = false 
}) => {
  const [city, setCity] = useState(item?.target_city || 'All');
  const [minFollowers, setMinFollowers] = useState(item?.min_followers || 0);
  const [interests, setInterests] = useState(item?.target_interests?.join(', ') || '');

  const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune'];

  const handleSubmit = () => {
    onConfirm({
      target_city: city,
      min_followers: parseInt(minFollowers.toString()),
      target_interests: interests.split(',').map(i => i.trim()).filter(i => i !== '')
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white border-[6px] border-black shadow-[20px_20px_0px_0px_#834bf1] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <header className="bg-black text-white p-6 flex justify-between items-center border-b-[6px] border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#ffde59] p-2 border-2 border-black rotate-3">
              <Target className="text-black" size={20} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase font-display leading-none">
                {isApproving ? 'Deployment Protocol' : 'Update Targeting'}
              </h2>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Configure Audience Node</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500 transition-colors">
            <X size={20} strokeWidth={4} />
          </button>
        </header>

        <main className="p-8 space-y-8 bg-[#fdfdfd]">
          <div className="bg-slate-50 border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1 italic">Targeting For:</p>
            <h4 className="text-lg font-black uppercase italic text-black truncate">{item.title}</h4>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#834bf1]">
                <MapPin size={14} /> Geographical Sector
              </label>
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#834bf1]">
                <Users size={14} /> Authority Level (Min Followers)
              </label>
              <input 
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-white border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#834bf1]">
                <Sparkles size={14} /> Niche Categories (Comma Separated)
              </label>
              <input 
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="FOOD, FASHION, TECH..."
                className="w-full bg-white border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#39ff14] text-black py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isApproving ? 'INITIATE DEPLOYMENT' : 'SYNC TARGETING'}
                <Zap fill="currentColor" size={20} />
              </>
            )}
          </button>
        </main>

        <footer className="p-4 bg-slate-100 border-t-[4px] border-black text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 italic">Targeting Protocol v4.5.1 • AUTHENTICATED</p>
        </footer>
      </div>
    </div>
  );
};
