import React from 'react';
import { CreatorFormData } from './CreatorCardView';
import { ChevronRight, Loader2, Globe, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

interface CreatorFormProps {
  onUpdate: (data: Partial<CreatorFormData>) => void;
  onSubmit: (data: CreatorFormData) => void;
  isSubmitting: boolean;
}

export const CreatorForm: React.FC<CreatorFormProps> = ({ onUpdate, onSubmit, isSubmitting }) => {
  const [data, setData] = React.useState<CreatorFormData>({
    fullName: '',
    platform: '',
    niche: '',
    city: '',
    email: '',
    phone: '',
    handle: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);
    onUpdate({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const platforms = [
    { id: 'Instagram', icon: <Instagram size={14} /> },
    { id: 'YouTube', icon: <Youtube size={14} /> },
    { id: 'LinkedIn', icon: <Linkedin size={14} /> },
    { id: 'X', icon: <Twitter size={14} /> },
    { id: 'Snapchat', icon: <Globe size={14} /> }
  ];

  const niches = ['Fashion', 'Food', 'Tech', 'Lifestyle', 'Finance', 'Fitness', 'Travel', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input - Direct Card Sync */}
      <div className="relative group">
        <input 
          required
          type="text"
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          placeholder=" "
          className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-transparent"
        />
        <label className="absolute left-5 top-5 text-[10px] font-black uppercase tracking-widest text-white/30 transition-all peer-focus:top-2 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-indigo-400">
          Full Name
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Platform Dropdown */}
        <div className="relative group">
          <select
            required
            name="platform"
            value={data.platform}
            onChange={handleChange}
            className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
          >
            <option value="" disabled className="bg-[#0a0a0a] text-white/40">Select</option>
            {platforms.map(p => (
              <option key={p.id} value={p.id} className="bg-[#0a0a0a] text-white">{p.id}</option>
            ))}
          </select>
          <label className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
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
            className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
          >
            <option value="" disabled className="bg-[#0a0a0a] text-white/40">Select</option>
            {niches.map(n => (
              <option key={n} value={n} className="bg-[#0a0a0a] text-white">{n}</option>
            ))}
          </select>
          <label className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
            Niche
          </label>
        </div>
      </div>

      <div className="relative group">
        <input 
          required
          type="text"
          name="handle"
          value={data.handle}
          onChange={handleChange}
          placeholder=" "
          className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-transparent"
        />
        <label className="absolute left-5 top-5 text-[10px] font-black uppercase tracking-widest text-white/30 transition-all peer-focus:top-2 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-indigo-400">
          Handle (@username)
        </label>
      </div>

      <div className="relative group">
        <input 
          required
          type="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          placeholder=" "
          className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-transparent"
        />
        <label className="absolute left-5 top-5 text-[10px] font-black uppercase tracking-widest text-white/30 transition-all peer-focus:top-2 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-indigo-400">
          Email Address
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative group">
          <input 
            type="text"
            name="city"
            value={data.city}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-transparent"
          />
          <label className="absolute left-5 top-5 text-[10px] font-black uppercase tracking-widest text-white/30 transition-all peer-focus:top-2 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-indigo-400">
            City
          </label>
        </div>
        <div className="relative group">
          <input 
            type="tel"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full bg-white/5 border border-white/10 rounded-2xl px-5 pt-7 pb-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-transparent"
          />
          <label className="absolute left-5 top-5 text-[10px] font-black uppercase tracking-widest text-white/30 transition-all peer-focus:top-2 peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-indigo-400">
            Phone
          </label>
        </div>
      </div>

      <button 
        disabled={isSubmitting}
        type="submit"
        className="w-full relative group bg-indigo-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <span className="flex items-center justify-center space-x-3">
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <span>Generate My Card</span>
              <ChevronRight size={18} />
            </>
          )}
        </span>
      </button>
      
      <p className="text-center text-[9px] text-white/20 font-black uppercase tracking-widest">
        100% Secure • High Impact • Creator Preferred
      </p>
    </form>
  );
};