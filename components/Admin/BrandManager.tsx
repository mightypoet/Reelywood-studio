import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { Building2, MapPin, Image as ImageIcon, Save, Edit2, Trash2, X, Globe, ExternalLink, Loader2, Zap, Gift } from 'lucide-react';

export const BrandManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '', 
    cover_image_url: '', 
    description: '',
    location_text: '',
    map_link: '',
    menu_link: ''
  });

  const fetchBrands = async () => {
    if (!supabase) return;
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_brands')
        .select(`
          *,
          missions (count),
          rewards (count)
        `)
        .order('created_at', { ascending: false });
      
      if (data) setBrands(data);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error fetching brands:", err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('partner_brands')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        alert("🚀 Brand Protocols Synchronized!");
      } else {
        const { error } = await supabase
          .from('partner_brands')
          .insert([formData]);

        if (error) throw error;
        alert("🚀 New Node Registered in the Alliance!");
      }

      setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '' });
      setEditingId(null);
      fetchBrands();

    } catch (err: any) {
      alert("Terminal Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: any) => {
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url,
      cover_image_url: brand.cover_image_url,
      description: brand.description,
      location_text: brand.location_text,
      map_link: brand.map_link,
      menu_link: brand.menu_link
    });
    setEditingId(brand.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    
    // Check for active missions or rewards linked to brand
    const brand = brands.find(b => b.id === id);
    const missionCount = brand?.missions?.[0]?.count || 0;
    
    if (missionCount > 0) {
      alert(`⛔ DENIED: This node has ${missionCount} active mission links. Sever missions first.`);
      return;
    }

    if (!window.confirm("⚠️ SYSTEM OVERRIDE: Are you sure? This will sever all links to this brand node.")) return;
    
    try {
      const { error } = await supabase.from('partner_brands').delete().eq('id', id);
      if (error) throw error;
      alert("Node Purged.");
      fetchBrands();
    } catch (err: any) {
      alert("Purge Failed: " + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '' });
    setEditingId(null);
  };

  const inputStyle = "w-full bg-white border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] text-black";

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="bg-white border-[6px] border-black p-8 lg:p-12 shadow-[12px_12px_0px_0px_#000]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-black italic uppercase flex items-center gap-4 font-display text-black">
            {editingId ? (
              <span className="text-[#834bf1]">Edit Identity</span>
            ) : (
              <span className="flex items-center gap-4"><Building2 size={40} className="text-[#834bf1]"/> Brand Node</span>
            )}
          </h2>
          
          {editingId && (
            <button onClick={handleCancel} className="bg-rose-500 text-white px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2">
              <X size={14} strokeWidth={3}/> Abort
            </button>
          )}
        </div>

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

              <div>
                 <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 flex items-center gap-2"><MapPin size={14}/> Location Text</label>
                 <input type="text" className={inputStyle} placeholder="City/Street" 
                    value={formData.location_text} onChange={e => setFormData({...formData, location_text: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Brand Brief</label>
                <textarea className={`${inputStyle} h-[245px] resize-none`} rows={6} placeholder="Describe the brand ecosystem..."
                   value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required ></textarea>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black text-sm uppercase tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 ${editingId ? 'bg-[#ffde59] text-black' : 'bg-[#834bf1] text-white'}`}>
             {loading ? <Loader2 className="animate-spin" /> : <Save size={20} strokeWidth={3} />} 
             <span>{loading ? "Processing..." : (editingId ? "Update System Details" : "Initialize Alliance Entry")}</span>
          </button>
        </form>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b-[4px] border-black pb-4">
           <h3 className="text-2xl font-black italic uppercase font-display tracking-tight text-black">Alliance Performance Nodes</h3>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse border border-black"></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic text-black">Live Monitor</span>
           </div>
        </div>

        {fetchLoading ? (
          <div className="py-20 text-center opacity-40 font-black uppercase tracking-[0.5em] text-xs text-black">Accessing Alliance Database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map(brand => (
              <div key={brand.id} className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col group hover:shadow-[12px_12px_0px_0px_#834bf1] transition-all">
                <div className="flex gap-6 items-start mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000] group-hover:rotate-3 transition-transform">
                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" 
                         onError={(e) => {e.currentTarget.src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + brand.name}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xl uppercase italic leading-none truncate mb-2 text-black">{brand.name}</h4>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest truncate flex items-center gap-2">
                      <MapPin size={10} /> {brand.location_text}
                    </p>
                  </div>
                </div>
                
                {/* BRAND MONITOR SECTION */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                   <div className="bg-slate-50 border-2 border-black p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#834bf1]">
                         <Zap size={12} />
                         <span className="text-lg font-black">{brand.missions?.[0]?.count || 0}</span>
                      </div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-black/40">Total Missions</p>
                   </div>
                   <div className="bg-slate-50 border-2 border-black p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#ffde59]">
                         <Gift size={12} fill="currentColor" />
                         <span className="text-lg font-black drop-shadow-sm">{brand.rewards?.[0]?.count || 0}</span>
                      </div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-black/40">Rewards Set</p>
                   </div>
                </div>

                <div className="flex gap-3 mt-auto">
                   <button 
                     onClick={() => handleEdit(brand)}
                     className="flex-1 bg-[#ffde59] py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black text-[10px] uppercase tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 text-black"
                   >
                     <Edit2 size={12} strokeWidth={3}/> Edit
                   </button>
                   <button 
                     onClick={() => handleDelete(brand.id)}
                     className="bg-rose-500 text-white px-4 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                   >
                     <Trash2 size={14} strokeWidth={3}/>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};