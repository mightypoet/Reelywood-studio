import React, { useState } from 'react';
import { supabase } from '../../lib/clients';
import { Building2, MapPin, Image as ImageIcon, Save, Trash2, ExternalLink } from 'lucide-react';

export const BrandManager = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    cover_image_url: '', 
    description: '',
    location_text: '',
    map_link: '',
    menu_link: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('partner_brands')
        .insert([formData]);

      if (error) throw error;
      alert("🚀 Partner Brand Onboarded! A global signal has been dispatched.");
      setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '' });
    } catch (err: any) {
      alert("Protocol Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-white border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border-[6px] border-black p-8 lg:p-12 shadow-[12px_12px_0px_0px_#000]">
        <h2 className="text-4xl font-black italic uppercase mb-10 flex items-center gap-4 font-display">
          <Building2 size={40} className="text-[#834bf1]"/> Brand Onboarding
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Identity Name</label>
                <input type="text" className={inputStyle} placeholder="e.g., Cabin 17A" 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 flex items-center gap-2"><ImageIcon size={14}/> Logo URL</label>
                   <input type="url" className={inputStyle} placeholder="https://..." 
                      value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} required />
                 </div>
                 <div>
                   <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 flex items-center gap-2"><ImageIcon size={14}/> Cover URL</label>
                   <input type="url" className={inputStyle} placeholder="https://..." 
                      value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} required />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 flex items-center gap-2"><MapPin size={14}/> Location</label>
                   <input type="text" className={inputStyle} placeholder="Anil Roy Road" 
                      value={formData.location_text} onChange={e => setFormData({...formData, location_text: e.target.value})} required />
                 </div>
                 <div>
                   <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40">Maps Link</label>
                   <input type="url" className={inputStyle} placeholder="https://goo.gl/..." 
                      value={formData.map_link} onChange={e => setFormData({...formData, map_link: e.target.value})} />
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Brand Brief</label>
                <textarea className={`${inputStyle} h-[145px] resize-none`} rows={4} placeholder="Describe the brand ecosystem and mission objectives..."
                   value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required ></textarea>
              </div>
              <div>
                <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40">Offerings/Menu Link</label>
                <input type="url" className={inputStyle} placeholder="Zomato / PDF / Website URL" 
                   value={formData.menu_link} onChange={e => setFormData({...formData, menu_link: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#834bf1] text-white py-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black text-sm uppercase tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95">
             <Save size={20} strokeWidth={3} /> 
             <span>{loading ? "Syncing Network..." : "Initialize Brand Entry"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};