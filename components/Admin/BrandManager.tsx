
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { Building2, MapPin, Image as ImageIcon, Save, Edit2, Trash2, X, Globe, ExternalLink, Loader2, Zap, Gift, Settings, ListChecks, ArrowRight, Mail, Wallet, Plus } from 'lucide-react';

export const BrandManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'missions' | 'vouchers' | 'settings'>('missions');
  const [brandMissions, setBrandMissions] = useState<any[]>([]);
  const [brandVouchers, setBrandVouchers] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '', 
    cover_image_url: '', 
    description: '',
    location_text: '',
    map_link: '',
    menu_link: '',
    brand_email: ''
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

  const handleFundWallet = async (brand: any) => {
    const amount = prompt(`Enter RC amount to fund ${brand.name}'s wallet:`);
    if (!amount || isNaN(Number(amount))) return;
    
    // Fix for TS18047: 'supabase' is possibly 'null'
    if (!supabase) {
      alert("Database link unavailable.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('partner_brands')
        .update({ reelcoins: (brand.reelcoins || 0) + Number(amount) })
        .eq('id', brand.id);
      
      if (error) throw error;
      alert(`✅ Success: ${amount} RC added to ${brand.name}`);
      fetchBrands();
    } catch (err: any) {
      alert("Funding Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandDetails = async (brandId: string) => {
    if (!supabase) return;
    setDetailLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        supabase.from('missions').select('*').eq('brand_id', brandId),
        supabase.from('rewards').select('*').eq('brand_id', brandId)
      ]);
      setBrandMissions(mRes.data || []);
      setBrandVouchers(vRes.data || []);
    } catch (err) {
      console.error("Detail Fetch Error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSelectBrand = (brand: any) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url,
      cover_image_url: brand.cover_image_url,
      description: brand.description,
      location_text: brand.location_text,
      map_link: brand.map_link,
      menu_link: brand.menu_link,
      brand_email: brand.brand_email || ''
    });
    setActiveTab('missions');
    fetchBrandDetails(brand.id);
  };

  const handleCloseModal = () => {
    setSelectedBrand(null);
    setIsCreatingNew(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    
    try {
      if (selectedBrand) {
        const { error } = await supabase
          .from('partner_brands')
          .update(formData)
          .eq('id', selectedBrand.id);
        if (error) throw error;
        alert("🚀 Brand Protocols Synchronized!");
      } else {
        const { error } = await supabase.from('partner_brands').insert([formData]);
        if (error) throw error;
        alert("🚀 New Node Registered!");
      }
      setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '', brand_email: '' });
      handleCloseModal();
      fetchBrands();
    } catch (err: any) {
      alert("Terminal Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (type: 'mission' | 'reward' | 'brand', id: string) => {
    if (!supabase) return;
    const table = type === 'mission' ? 'missions' : type === 'reward' ? 'rewards' : 'partner_brands';
    
    if (type === 'brand') {
      const brand = brands.find(b => b.id === id);
      if ((brand?.missions?.[0]?.count || 0) > 0 || (brand?.rewards?.[0]?.count || 0) > 0) {
        alert("⛔ DENIED: Active links detected. Purge sub-nodes first.");
        return;
      }
    }

    if (!window.confirm(`⚠️ SYSTEM OVERRIDE: Confirm deletion of this ${type}?`)) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      if (type === 'brand') {
        handleCloseModal();
        fetchBrands();
      } else {
        fetchBrandDetails(selectedBrand.id);
        fetchBrands();
      }
    } catch (err: any) {
      alert("Purge Failed: " + err.message);
    }
  };

  const inputStyle = "w-full bg-white border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] text-black";

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#000] flex flex-col md:flex-row justify-between items-center gap-6 text-black">
        <div>
          <h2 className="text-3xl font-black italic uppercase font-display text-black">Alliance Network</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Scale • Manage • Deploy</p>
        </div>
        <button 
          onClick={() => {
            setSelectedBrand(null);
            setIsCreatingNew(true);
            setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '', brand_email: '' });
            setActiveTab('settings');
          }}
          className="bg-[#834bf1] text-white px-10 py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-4"
        >
          <Building2 size={20} />
          Initialize New Alliance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fetchLoading ? (
          <div className="col-span-full py-20 text-center opacity-40 font-black uppercase tracking-[0.5em] text-xs text-black">Accessing Node Database...</div>
        ) : (
          brands.map(brand => (
            <div 
              key={brand.id} 
              className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col group hover:shadow-[16px_16px_0px_0px_#834bf1] transition-all cursor-default"
            >
              <div className="flex gap-6 items-start mb-6 cursor-pointer" onClick={() => handleSelectBrand(brand)}>
                <div className="w-16 h-16 bg-slate-50 border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000] group-hover:rotate-3 transition-transform">
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" 
                       onError={(e) => {e.currentTarget.src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + brand.name}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-xl uppercase italic leading-none truncate mb-2 text-black">{brand.name}</h4>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest truncate flex items-center gap-2">
                      <MapPin size={10} /> {brand.location_text}
                    </p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <Wallet size={10} /> {brand.reelcoins || 0} RC
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mt-auto">
                 <button 
                  onClick={() => handleFundWallet(brand)}
                  className="w-full bg-[#39ff14] text-black border-2 border-black p-3 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                 >
                   <Plus size={14} strokeWidth={4} />
                   Fund Wallet
                 </button>
                 <div className="grid grid-cols-2 gap-2 text-black" onClick={() => handleSelectBrand(brand)}>
                   <div className="bg-slate-50 border-2 border-black p-2 text-center cursor-pointer">
                      <div className="flex items-center justify-center gap-2 text-[#834bf1]">
                         <Zap size={10} />
                         <span className="text-sm font-black">{brand.missions?.[0]?.count || 0}</span>
                      </div>
                      <p className="text-[6px] font-black uppercase tracking-widest text-black/40">Missions</p>
                   </div>
                   <div className="bg-slate-50 border-2 border-black p-2 text-center cursor-pointer">
                      <div className="flex items-center justify-center gap-2 text-[#ffde59]">
                         <Gift size={10} fill="currentColor" className="stroke-black stroke-[2px]" />
                         <span className="text-sm font-black">{brand.rewards?.[0]?.count || 0}</span>
                      </div>
                      <p className="text-[6px] font-black uppercase tracking-widest text-black/40">Vouchers</p>
                   </div>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {(selectedBrand || isCreatingNew) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleCloseModal}></div>
          
          <div className="relative w-full max-w-4xl bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b-[4px] border-black bg-[#f8f8f8] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-2 flex items-center justify-center overflow-hidden">
                  <img src={formData.logo_url} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic uppercase font-display leading-none text-black">
                    {selectedBrand ? selectedBrand.name : 'New Alliance'}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <MapPin size={12}/> {formData.location_text || 'PENDING LOCATION'}
                    </p>
                    {selectedBrand && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                        <Wallet size={12}/> {selectedBrand.reelcoins || 0} RC
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={handleCloseModal} className="bg-rose-500 text-white p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                <X size={24} strokeWidth={4}/>
              </button>
            </div>

            <div className="flex border-b-[4px] border-black bg-white">
              {[
                { id: 'missions', label: 'Active Missions', icon: Zap },
                { id: 'vouchers', label: 'Reward Nodes', icon: Gift },
                { id: 'settings', label: 'Node Settings', icon: Settings }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-5 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all border-r-[4px] border-black last:border-r-0 ${activeTab === tab.id ? 'bg-[#ffde59] text-black' : 'text-black/40 hover:bg-slate-50'}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-white text-black custom-scrollbar">
              {activeTab === 'missions' && (
                <div className="space-y-6">
                  {detailLoading ? (
                    <div className="py-20 text-center opacity-20 font-black animate-pulse">Scanning Grid...</div>
                  ) : brandMissions.length === 0 ? (
                    <div className="py-20 text-center border-4 border-dashed border-black/10">
                      <p className="font-black uppercase tracking-widest text-black/20 italic">No Missions Deployed.</p>
                    </div>
                  ) : (
                    brandMissions.map(m => (
                      <div key={m.id} className="bg-slate-50 border-[3px] border-black p-5 flex items-center justify-between group shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#834bf1] transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#fff]">
                              <Zap size={20} />
                           </div>
                           <div>
                             <h4 className="font-black text-sm uppercase italic">{m.title}</h4>
                             <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest">+{m.reward_amount} RC Pool</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem('mission', m.id)}
                          className="p-3 bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                          <Trash2 size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'vouchers' && (
                <div className="space-y-6">
                  {detailLoading ? (
                    <div className="py-20 text-center opacity-20 font-black animate-pulse">Accessing Vault...</div>
                  ) : brandVouchers.length === 0 ? (
                    <div className="py-20 text-center border-4 border-dashed border-black/10">
                      <p className="font-black uppercase tracking-widest text-black/20 italic">No Reward Nodes Configured.</p>
                    </div>
                  ) : (
                    brandVouchers.map(v => (
                      <div key={v.id} className="bg-slate-50 border-[3px] border-black p-5 flex items-center justify-between group shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#834bf1] transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-[#ffde59] text-black flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                              <Gift size={20} fill="currentColor" className="stroke-black stroke-[2px]"/>
                           </div>
                           <div>
                             <h4 className="font-black text-sm uppercase italic">{v.title}</h4>
                             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Cost: {v.cost} RC</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem('reward', v.id)}
                          className="p-3 bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                          <Trash2 size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Brand Identity Name</label>
                        <input type="text" className={inputStyle} placeholder="Identity Node Name" 
                           value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      
                      <div>
                        <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-[#834bf1] italic">Brand Login Email (Authorized Partner)</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                            <Mail size={16} strokeWidth={3} />
                          </div>
                          <input 
                            type="email" 
                            className={`${inputStyle} pl-12`} 
                            placeholder="partner@login.com" 
                            value={formData.brand_email} 
                            onChange={e => setFormData({...formData, brand_email: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Logo Asset URL</label>
                          <input type="url" className={inputStyle} placeholder="https://..." 
                             value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} required />
                        </div>
                        <div>
                          <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Cover Asset URL</label>
                          <input type="url" className={inputStyle} placeholder="https://..." 
                             value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} required />
                        </div>
                      </div>
                      <div>
                         <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Physical Location Text</label>
                         <input type="text" className={inputStyle} placeholder="City, Sector..." 
                            value={formData.location_text} onChange={e => setFormData({...formData, location_text: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Mission Brief Description</label>
                        <textarea className={`${inputStyle} h-[320px] resize-none`} rows={8} placeholder="Define brand DNA and ecosystem rules..."
                           value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t-[4px] border-black">
                    <button type="submit" disabled={loading} className="flex-1 py-6 bg-[#834bf1] text-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black text-sm uppercase tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">
                       {loading ? <Loader2 className="animate-spin" /> : <Save size={20} strokeWidth={3} />} 
                       <span>{selectedBrand ? "Sync Node Data" : "Initialize New Alliance"}</span>
                    </button>
                    {selectedBrand && (
                      <button 
                        type="button"
                        onClick={() => handleDeleteItem('brand', selectedBrand.id)}
                        className="px-10 bg-rose-500 text-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center"
                      >
                        <Trash2 size={24} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-6 border-t-[4px] border-black bg-[#f0f0f0] flex justify-between items-center px-10">
               <div className="flex gap-8">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-black/30">Node ID</span>
                    <span className="text-[10px] font-black italic">{selectedBrand?.id?.slice(0,8) || 'GENERATING'}...</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-black/30">Network Status</span>
                    <span className="text-[10px] font-black italic text-emerald-500">ACTIVE_SYNC</span>
                 </div>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20">REELY_STUDIO_TERMINAL v4.2</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
