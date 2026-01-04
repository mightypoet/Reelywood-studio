
import React, { useEffect, useState } from 'react';
// Fix: Import CreatorFormData from CreatorCardView where it is defined, instead of About.
import { CreatorFormData } from './CreatorCardView';
import { ChevronRight, Loader2, Globe, Instagram, Youtube, Linkedin, Twitter, Users, ArrowRight } from 'lucide-react';

interface CreatorFormProps {
  onUpdate: (data: Partial<CreatorFormData>) => void;
  onSubmit: (data: CreatorFormData) => void;
  isSubmitting: boolean;
  externalData?: CreatorFormData;
  onAcademyClick?: () => void;
}

const FORMSPARK_FORM_ID = "REELYWOOD_CREATOR_SYNC_ID"; 
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwS8XaS2zURf24cEevwrst4RL8hclcoRAWuCy4Mi6YdAtL-3PAFuF6baFjvcyTM0uo4Sg/exec";

const initialData: CreatorFormData = {
  fullName: '',
  platform: '',
  niche: '',
  city: '',
  email: '',
  phone: '',
  handle: '',
  followers: ''
};

export const CreatorForm: React.FC<CreatorFormProps> = ({ onUpdate, onSubmit, isSubmitting, externalData, onAcademyClick }) => {
  const [data, setData] = useState<CreatorFormData>(initialData);

  // Sync internal state if parent resets data
  useEffect(() => {
    if (externalData) {
      setData(externalData);
    }
  }, [externalData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);
    onUpdate({ [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Trigger parent submission logic (Firebase + UI states)
    onSubmit(data);
    
    // Prepare FormData for Google Sheets
    const formPayload = new FormData();
    formPayload.append('fullName', data.fullName);
    formPayload.append('email', data.email);
    formPayload.append('platform', data.platform);
    formPayload.append('niche', data.niche);
    formPayload.append('handle', data.handle);
    formPayload.append('followers', data.followers);
    formPayload.append('city', data.city);
    formPayload.append('phone', data.phone);

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: formPayload,
        mode: 'no-cors' 
      });

      // Optional: Silent secondary sync
      fetch(`https://submit-form.com/${FORMSPARK_FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
      }).catch(() => {});
      
    } catch (error) {
      console.warn("Minor transmission node failed.");
    }
  };

  const platforms = [
    { id: 'Instagram' }, { id: 'YouTube' }, { id: 'LinkedIn' }, { id: 'X' }, { id: 'Snapchat' }
  ];

  const niches = ['Fashion', 'Food', 'Tech', 'Lifestyle', 'Finance', 'Fitness', 'Travel', 'Other'];

  const inputClasses = "peer w-full bg-white dark:bg-white border-[3px] border-black rounded-none px-5 pt-8 pb-3 text-sm text-black focus:outline-none transition-all appearance-none";
  const labelClasses = "absolute left-5 top-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/60 transition-all pointer-events-none";

  const followerCount = parseInt(data.followers) || 0;
  const showGrowthTrack = followerCount > 0 && followerCount < 1000;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative group">
        <input 
          required
          type="text"
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className={inputClasses}
        />
        <label className={labelClasses}>Full Name</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative group">
          <select required name="platform" value={data.platform} onChange={handleChange} className={inputClasses}>
            <option value="" disabled className="bg-white text-black/40">Platform</option>
            {platforms.map(p => <option key={p.id} value={p.id} className="bg-white text-black">{p.id}</option>)}
          </select>
          <label className={labelClasses}>Platform</label>
          <div className="absolute right-5 top-[55%] -translate-y-1/2 pointer-events-none opacity-50">
             <ChevronRight className="rotate-90 text-black" size={14} />
          </div>
        </div>
        <div className="relative group">
          <select required name="niche" value={data.niche} onChange={handleChange} className={inputClasses}>
            <option value="" disabled className="bg-white text-black/40">Niche</option>
            {niches.map(n => <option key={n} value={n} className="bg-white text-black">{n}</option>)}
          </select>
          <label className={labelClasses}>Niche</label>
          <div className="absolute right-5 top-[55%] -translate-y-1/2 pointer-events-none opacity-50">
             <ChevronRight className="rotate-90 text-black" size={14} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative group">
          <input required type="text" name="handle" value={data.handle} onChange={handleChange} placeholder="@username" className={inputClasses} />
          <label className={labelClasses}>Handle</label>
        </div>
        <div className="relative group">
          <input required type="number" name="followers" value={data.followers} onChange={handleChange} placeholder="Count" className={inputClasses} />
          <label className={labelClasses}>Followers</label>
        </div>
      </div>

      <div className="relative group">
        <input required type="email" name="email" value={data.email} onChange={handleChange} placeholder="Email" className={inputClasses} />
        <label className={labelClasses}>Email Address</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative group">
          <input type="text" name="city" value={data.city} onChange={handleChange} placeholder="City" className={inputClasses} />
          <label className={labelClasses}>City</label>
        </div>
        <div className="relative group">
          <input type="tel" name="phone" value={data.phone} onChange={handleChange} placeholder="Phone" className={inputClasses} />
          <label className={labelClasses}>Phone</label>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full relative group bg-[#834bf1] text-white py-5 sm:py-6 rounded-none font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] transition-all border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          <span className="flex items-center justify-center space-x-3">
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <span>Sync Identity Node</span>
            )}
          </span>
        </button>

        {showGrowthTrack && (
          <button 
            type="button"
            onClick={onAcademyClick}
            className="w-full flex items-center justify-center space-x-2 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#834bf1] transition-colors py-2 group"
          >
            <span>Show Me How To Grow</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      
      <p className="text-center text-[8px] sm:text-[9px] text-black/40 font-black uppercase tracking-widest pt-4">
        100% Secure • High Impact • Creator Preferred
      </p>
    </form>
  );
};
