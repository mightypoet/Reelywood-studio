
import React, { useEffect } from 'react';
import { CreatorFormData } from './About';
import { ChevronRight, Loader2, Globe, Instagram, Youtube, Linkedin, Twitter, Users } from 'lucide-react';

interface CreatorFormProps {
  onUpdate: (data: Partial<CreatorFormData>) => void;
  onSubmit: (data: CreatorFormData) => void;
  isSubmitting: boolean;
}

// Replace this with your actual Formspark Form ID
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

export const CreatorForm: React.FC<CreatorFormProps> = ({ onUpdate, onSubmit, isSubmitting }) => {
  const [data, setData] = React.useState<CreatorFormData>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);
    onUpdate({ [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare FormData specifically for Google Apps Script requirements
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
      // Send to parent first to trigger UI state (loading)
      onSubmit(data);

      // Node A: Execute Google Sheets transmission
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: formPayload,
        mode: 'no-cors' 
      });
      console.log("Google Sheets sync transmission finished.");

      // Node C: Silent backup to Formspark
      fetch(`https://submit-form.com/${FORMSPARK_FORM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...data,
          submission_type: "Creator Identity Sync",
          timestamp: new Date().toISOString()
        }),
      }).catch(err => console.warn("Formspark backup skipped", err));
      
      // Reset form to default state
      setData(initialData);
      
    } catch (error) {
      console.error("Sync error:", error);
      // Even on error, we reset to return to "default" as requested
      setData(initialData);
    }
  };

  const platforms = [
    { id: 'Instagram', icon: <Instagram size={14} /> },
    { id: 'YouTube', icon: <Youtube size={14} /> },
    { id: 'LinkedIn', icon: <Linkedin size={14} /> },
    { id: 'X', icon: <Twitter size={14} /> },
    { id: 'Snapchat', icon: <Globe size={14} /> }
  ];

  const niches = ['Fashion', 'Food', 'Tech', 'Lifestyle', 'Finance', 'Fitness', 'Travel', 'Other'];

  const inputClasses = "peer w-full bg-[#0d0d0d] border border-white/5 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-transparent";
  const labelClasses = "absolute left-5 top-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/80 transition-all pointer-events-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Input */}
      <div className="relative group">
        <input 
          required
          type="text"
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          placeholder=" "
          className={inputClasses}
        />
        <label className={labelClasses}>
          Full Name
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Platform Dropdown */}
        <div className="relative group">
          <select
            required
            name="platform"
            value={data.platform}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="" disabled className="bg-[#0a0a0a] text-white/40">Select Platform</option>
            {platforms.map(p => (
              <option key={p.id} value={p.id} className="bg-[#0a0a0a] text-white">{p.id}</option>
            ))}
          </select>
          <label className={labelClasses}>
            Platform
          </label>
        </div>

        {/* Niche Dropdown */}
        <div className="relative group">
          <select
            required
            name="niche"
            value={data.niche}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="" disabled className="bg-[#0a0a0a] text-white/40">Select Niche</option>
            {niches.map(n => (
              <option key={n} value={n} className="bg-[#0a0a0a] text-white">{n}</option>
            ))}
          </select>
          <label className={labelClasses}>
            Niche
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Handle Input */}
        <div className="relative group">
          <input 
            required
            type="text"
            name="handle"
            value={data.handle}
            onChange={handleChange}
            placeholder=" "
            className={inputClasses}
          />
          <label className={labelClasses}>
            Handle (@username)
          </label>
        </div>

        {/* Followers Input */}
        <div className="relative group">
          <input 
            required
            type="number"
            name="followers"
            value={data.followers}
            onChange={handleChange}
            placeholder=" "
            className={inputClasses}
          />
          <label className={labelClasses}>
            Followers
          </label>
        </div>
      </div>

      {/* Email Input */}
      <div className="relative group">
        <input 
          required
          type="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          placeholder=" "
          className={inputClasses}
        />
        <label className={labelClasses}>
          Email Address
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City Input */}
        <div className="relative group">
          <input 
            type="text"
            name="city"
            value={data.city}
            onChange={handleChange}
            placeholder=" "
            className={inputClasses}
          />
          <label className={labelClasses}>
            City
          </label>
        </div>
        {/* Phone Input */}
        <div className="relative group">
          <input 
            type="tel"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder=" "
            className={inputClasses}
          />
          <label className={labelClasses}>
            Phone
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        disabled={isSubmitting}
        type="submit"
        className="w-full relative group bg-indigo-600 text-white py-5 sm:py-6 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl shadow-indigo-600/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <span className="flex items-center justify-center space-x-3">
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <span>Generate My Card</span>
            </>
          )}
        </span>
      </button>
      
      <p className="text-center text-[8px] sm:text-[9px] text-white/20 font-black uppercase tracking-widest pt-4">
        100% Secure • High Impact • Creator Preferred
      </p>
    </form>
  );
};
