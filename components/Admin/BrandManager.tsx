
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { Building2, MapPin, Image as ImageIcon, Save, Edit2, Trash2, X, Globe, ExternalLink, Loader2, Zap, Gift, Settings, ListChecks, ArrowRight, Mail, Wallet, Plus, Upload, Check, RotateCcw, Link as LinkIcon, Crosshair } from 'lucide-react';
import { TargetingModal } from './TargetingModal';

export const BrandManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'missions' | 'vouchers' | 'settings'>('missions');
  const [brandMissions, setBrandMissions] = useState<any[]>([]);
  const [brandVouchers, setBrandVouchers] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Targeting Modal State
  const [targetingItem, setTargetingItem] = useState<{item: any, type: 'mission' | 'reward', isApproving: boolean} | null>(null);

  // Asset method toggles
  const [logoMethod, setLogoMethod] = useState<'file' | 'link'>('file');
  const [coverMethod, setCoverMethod] = useState<'file' | 'link'>('link');

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '', 
    cover_image_url: '', 
    description: '',
    location_text: '',
    map_link: '',
    menu_link: '',
    brand_email: '',
    reelcoins: 0
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

  const fetchPendingMissions = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*, partner_brands(*)')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });
      
      if (data) setPendingMissions(data);
      if (error) throw error;
    } catch (err) {
      console.error("Error fetching pending missions:", err);
    }
  };

  const handleTargetingSubmit = async (targetingData: any) => {
    if (!supabase || !targetingItem) return;
    setLoading(true);
    try {
      const table = targetingItem.type === 'mission' ? 'missions' : 'rewards';
      const updates = {
        ...targetingData,
        status: targetingItem.isApproving ? 'active' : (targetingItem.item.status || 'active')
      };

      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', targetingItem.item.id);
      
      if (error) throw error;
      
      alert(targetingItem.isApproving ? "DEPLOYMENT_AUTHORIZED: Mission is now live." : "TARGETING_SYNCED: Audience nodes updated.");
      setTargetingItem(null);
      await fetchPendingMissions();
      await fetchBrands();
      if (selectedBrand) fetchBrandDetails(selectedBrand.id);
    } catch (err: any) {
      alert("Terminal Sync Failure: " + err.message);
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
    fetchPendingMissions();
  }, []);

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'cover_image_url') => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const folder = field === 'logo_url' ? 'logos' : 'covers';
      const fileName = `brands/${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error: any) {
      alert("Asset Upload Failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

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
      brand_email: brand.brand_email || '',
      reelcoins: brand.reelcoins || 0
    });
    setActiveTab('missions');
    fetchBrandDetails(brand.id);
  };

  const handleFundBrand = async (e: React.MouseEvent, brand: any) => {
    e.stopPropagation();
    const amountStr = window.prompt(`Enter RC amount to add to ${brand.name}:`, "5000");
    if (!amountStr || isNaN(Number(amountStr))) return;
    
    const amount = parseInt(amountStr);
    setLoading(true);
    try {
      const { error } = await supabase!
        .from('partner_brands')
        .update({ reelcoins: (brand.reelcoins || 0) + amount })
        .eq('id', brand.id);
      
      if (error) throw error;
      alert(`Successfully funded ${brand.name} with ${amount} RC.`);
      fetchBrands();
    } catch (err: any) {
      alert("Funding Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetBalance = async (e: React.MouseEvent, brand: any) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to RESET ${brand.name}'s wallet to 0 RC?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase!
        .from('partner_brands')
        .update({ reelcoins: 0 })
        .eq('id', brand.id);
      
      if (error) throw error;
      alert("WALLET_RESET_SUCCESSFUL: Ledger synchronized to 0.");
      fetchBrands();
    } catch (err: any) {
      alert("Reset Error: " + err.message);
    } finally {
      setLoading(false);
    }
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
      setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '', brand_email: '', reelcoins: 0 });
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
        fetchBrands(); // Refresh counts in bg
      }
    } catch (err: any) {
      alert("Purge Failed: " + err.message);
    }
  };

  const inputStyle = "w-full bg-white border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] text-black";

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-black">
      {/* Targeting Modal Integration */}
      {targetingItem && (
        <TargetingModal 
          item={targetingItem.item} 
          type={targetingItem.type}
          isApproving={targetingItem.isApproving}
          loading={loading}
          onClose={() => setTargetingItem(null)}
          onConfirm={handleTargetingSubmit}
        />
      )}

      {/* MISSION REQUEST QUEUE SECTION */}
      <div className="bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#834bf1] text-black">
        <h3 className="text-2xl font-black italic uppercase font-display mb-6 flex items-center gap-3">
          <Zap className="text-[#834bf1]" /> PENDING MISSION REQUESTS
        </h3>
        <div className="space-y-4">
          {pendingMissions.length === 0 ? (
            <div className="py-10 text-center border-4 border-dashed border-black/10 text-black/20 font-black uppercase text-xs italic tracking-widest">
              QUEUE_SILENT: No pending mission requests detected.
            </div>
          ) : (
            pendingMissions.map(m => (
              <div key={m.id} className="bg-slate-50 border-[3px] border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center gap-6 min-w-0">
                  <div className="w-12 h-12 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] p-1 shrink-0">
                    <img src={m.partner_brands?.logo_url} className="w-full h-full object-contain" onError={e => e.currentTarget.src='https://api.dicebear.com/7.x/identicon/svg?seed='+m.partner_brands?.name} alt="Brand Logo" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm uppercase italic truncate">{m.title}</h4>
                    <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest">
                      {m.partner_brands?.name || 'Unknown Brand'} • Bounty: {m.reward_amount} RC
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setTargetingItem({item: m, type: 'mission', isApproving: true})}
                  disabled={loading}
                  className="bg-[#39ff14] text-black p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center min-w-[100px] gap-2"
                >
                  <Check size={20} strokeWidth={4} />
                  <span className="font-black text-[10px] uppercase">APPROVE</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#000] flex flex-col md:flex-row justify-between items-center gap-6 text-black">
        <div>
          <h2 className="text-3xl font-black italic uppercase font-display text-black">Alliance Directory</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Scale • Manage • Deploy</p>
        </div>
        <button 
          onClick={() => {
            setSelectedBrand(null);
            setIsCreatingNew(true);
            setFormData({ name: '', logo_url: '', cover_image_url: '', description: '', location_text: '', map_link: '', menu_link: '', brand_email: '', reelcoins: 0 });
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
              onClick={() => handleSelectBrand(brand)}
              className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col group hover:shadow-[16px_16px_0px_0px_#834bf1] transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex gap-6 items-start mb-6">
                <div className="w-16 h-16 bg-slate-50 border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000] group-hover:rotate-3 transition-transform">
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" 
                       onError={(e) => {e.currentTarget.src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + brand.name}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-xl uppercase italic leading-none truncate mb-2 text-black">{brand.name}</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleFundBrand(e, brand)}
                        className="p-1.5 bg-[#ffde59] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        <Wallet size={14} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={(e) => handleResetBalance(e, brand)}
                        className="p-1.5 bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        <RotateCcw size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate flex items-center gap-2">
                    <Wallet size={10} /> {brand.reelcoins?.toLocaleString() || 0} RC
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto text-black">
                 <div className="bg-slate-50 border-2 border-black p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#834bf1]">
                       <Zap size={12} />
                       <span className="text-lg font-black">{brand.missions?.[0]?.count || 0}</span>
                    </div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-black/40">Missions</p>
                 </div>
                 <div className="bg-slate-50 border-2 border-black p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#ffde59]">
                       <Gift size={12} fill="currentColor" className="stroke-black stroke-[3px]" />
                       <span className="text-lg font-black">{brand.rewards?.[0]?.count || 0}</span>
                    </div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-black/40">Vouchers</p>
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-2 flex items-center gap-2">
                    <MapPin size={12}/> {formData.location_text || 'PENDING LOCATION'}
                  </p>
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setTargetingItem({item: m, type: 'mission', isApproving: false})}
                            className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                          >
                            <Crosshair size={16} strokeWidth={3} className="text-[#834bf1]" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem('mission', m.id)}
                            className="p-3 bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                          >
                            <Trash2 size={16} strokeWidth={3} />
                          </button>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setTargetingItem({item: v, type: 'reward', isApproving: false})}
                            className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                          >
                            <Crosshair size={16} strokeWidth={3} className="text-[#834bf1]" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem('reward', v.id)}
                            className="p-3 bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                          >
                            <Trash2 size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-300">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-8">
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

                      {/* LOGO MANAGEMENT */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block font-black text-[10px] uppercase tracking-[0.3em] text-black/40 italic">Logo Identity</label>
                          <div className="flex bg-slate-100 border-2 border-black p-0.5">
                            <button type="button" onClick={() => setLogoMethod('file')} className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${logoMethod === 'file' ? 'bg-black text-white' : 'text-black/40'}`}>FILE</button>
                            <button type="button" onClick={() => setLogoMethod('link')} className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${logoMethod === 'link' ? 'bg-black text-white' : 'text-black/40'}`}>URL</button>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-start">
                          <div className="flex-1">
                            {logoMethod === 'file' ? (
                              <label className="cursor-pointer">
                                <div className={`flex items-center justify-center gap-3 ${inputStyle} bg-slate-50 border-dashed border-[#834bf1] hover:bg-[#834bf1]/10`}>
                                  {uploading ? <Loader2 size={16} className="animate-spin text-[#834bf1]" /> : <Upload size={16} className="text-[#834bf1]" />}
                                  <span className="text-[10px] uppercase tracking-widest text-black/60">{uploading ? 'Processing...' : 'Upload Logo'}</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'logo_url')} disabled={uploading} />
                                </div>
                              </label>
                            ) : (
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                                  <LinkIcon size={14} />
                                </div>
                                <input type="url" className={`${inputStyle} pl-12`} placeholder="https://..." 
                                  value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} />
                              </div>
                            )}
                          </div>
                          {formData.logo_url && (
                            <div className="w-16 h-16 border-[3px] border-black bg-white flex items-center justify-center p-2 shrink-0 shadow-[4px_4px_0px_0px_#000]">
                              <img src={formData.logo_url} className="w-full h-full object-contain" alt="Logo Preview" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COVER IMAGE MANAGEMENT */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block font-black text-[10px] uppercase tracking-[0.3em] text-black/40 italic">Cover Asset</label>
                          <div className="flex bg-slate-100 border-2 border-black p-0.5">
                            <button type="button" onClick={() => setCoverMethod('file')} className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${coverMethod === 'file' ? 'bg-black text-white' : 'text-black/40'}`}>FILE</button>
                            <button type="button" onClick={() => setCoverMethod('link')} className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${coverMethod === 'link' ? 'bg-black text-white' : 'text-black/40'}`}>URL</button>
                          </div>
                        </div>

                        <div className="space-y-4">
                           {coverMethod === 'file' ? (
                              <label className="cursor-pointer block w-full">
                                <div className={`flex items-center justify-center gap-3 ${inputStyle} bg-slate-50 border-dashed border-black/20 hover:bg-black/5`}>
                                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                                  <span className="text-[10px] uppercase tracking-widest text-black/60">{uploading ? 'Processing...' : 'Upload Cover Photo'}</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'cover_image_url')} disabled={uploading} />
                                </div>
                              </label>
                            ) : (
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                                  <LinkIcon size={14} />
                                </div>
                                <input type="url" className={`${inputStyle} pl-12`} placeholder="https://..." 
                                  value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} required />
                              </div>
                            )}
                            {formData.cover_image_url && (
                              <div className="w-full h-32 border-[3px] border-black bg-slate-100 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                                <img src={formData.cover_image_url} className="w-full h-full object-cover" alt="Cover Preview" />
                              </div>
                            )}
                        </div>
                      </div>

                      <div>
                         <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Physical Location Text</label>
                         <input type="text" className={inputStyle} placeholder="City, Sector..." 
                            value={formData.location_text} onChange={e => setFormData({...formData, location_text: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Mission Brief Description</label>
                        <textarea className={`${inputStyle} h-[450px] resize-none`} rows={8} placeholder="Define brand DNA and ecosystem rules..."
                           value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-8 border-t-[4px] border-black">
                    <button type="submit" disabled={loading || uploading} className="flex-1 py-6 bg-[#834bf1] text-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black text-sm uppercase tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50">
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
