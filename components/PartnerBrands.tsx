
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/clients';
import { X, MapPin, ExternalLink, Sparkle, Target, ArrowRight, Building2 } from 'lucide-react';

export const PartnerBrands = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('partner_brands')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setBrands(data);
    };
    fetchBrands();
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors border-y-[6px] border-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <div className="space-y-6">
              <div className="bg-[#ffde59] border-[3px] border-black inline-flex items-center space-x-3 px-6 py-2 font-black italic uppercase text-[10px] tracking-[0.4em] shadow-[6px_6px_0px_0px_#000]">
                <Target size={14} strokeWidth={3} />
                <span>Verified Partners</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white font-display uppercase tracking-tighter italic">
                The Brand <span className="text-[#834bf1]">Alliance</span>
              </h2>
           </div>
           <p className="text-black/40 dark:text-white/30 font-black uppercase text-[10px] tracking-[0.4em] max-w-xs text-right italic">
             Mission Critical Nodes within the Reelywood Ecosystem.
           </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {brands.map((brand, i) => (
            <button 
              key={brand.id} 
              onClick={() => setSelectedBrand(brand)}
              className="group relative aspect-square bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center p-6 overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-[#834bf1] translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
              <img 
                src={brand.logo_url} 
                alt={brand.name} 
                className="relative z-10 w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all group-hover:scale-110" 
              />
            </button>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedBrand && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedBrand(null)}></div>
           
           <div className="relative w-full max-w-3xl bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#ffde59] overflow-y-auto max-h-[95vh] animate-in zoom-in-95 duration-300 custom-scrollbar">
              {/* Close Protocol */}
              <button 
                onClick={() => setSelectedBrand(null)} 
                className="absolute top-4 right-4 z-[60] bg-black text-white p-2 md:p-3 border-[3px] border-white hover:bg-rose-600 transition-colors shadow-[4px_4px_0px_0px_#000]"
              >
                <X size={20} md:size={24} strokeWidth={4} />
              </button>

              {/* Cover Container */}
              <div className="relative h-48 md:h-72 border-b-[6px] border-black overflow-visible">
                 <img src={selectedBrand.cover_image_url} className="w-full h-full object-cover" alt="Brand Cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                 
                 {/* Floating Logo - Adjusted to prevent overlap with title */}
                 <div className="absolute -bottom-10 left-6 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-white border-[6px] border-black p-3 md:p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 flex items-center justify-center overflow-hidden">
                    {selectedBrand.logo_url ? (
                      <img src={selectedBrand.logo_url} className="w-full h-full object-contain" alt="Brand Logo"/>
                    ) : (
                      <Building2 size={40} className="text-black" />
                    )}
                 </div>

                 <div className="absolute bottom-4 right-6 md:right-10 flex items-center space-x-3">
                   <div className="bg-[#ffde59] text-black px-4 py-2 border-[3px] border-black font-black text-[9px] md:text-[10px] uppercase tracking-widest italic shadow-[4px_4px_0px_0px_#000]">
                     Operational Node
                   </div>
                 </div>
              </div>

              {/* Data Panel - Added padding-top to account for floating logo */}
              <div className="p-6 md:p-10 pt-16 md:pt-20">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                   <h2 className="text-4xl md:text-5xl font-black italic uppercase font-display tracking-tighter text-black break-words leading-none">
                     {selectedBrand.name}
                   </h2>
                   {selectedBrand.location_text && (
                     <a href={selectedBrand.map_link} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-3 font-black text-[10px] md:text-xs bg-slate-100 border-[3px] border-black px-4 py-2 md:px-6 md:py-3 hover:bg-[#834bf1] hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none w-fit">
                        <MapPin size={16} strokeWidth={3}/> 
                        <span className="uppercase tracking-widest">{selectedBrand.location_text}</span>
                        <ExternalLink size={14}/>
                     </a>
                   )}
                 </div>

                 <p className="font-bold text-base md:text-lg leading-relaxed text-black/70 uppercase tracking-tight mb-10 border-l-[8px] border-[#834bf1] pl-6 md:pl-8 py-2">
                    {selectedBrand.description}
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-slate-50 border-[3px] border-black p-5 md:p-6 shadow-[4px_4px_0px_0px_#000]">
                       <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">Network Status</p>
                       <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                          <span className="text-xs md:text-sm font-black italic uppercase text-black">Synchronized</span>
                       </div>
                    </div>
                    <div className="bg-slate-50 border-[3px] border-black p-5 md:p-6 shadow-[4px_4px_0px_0px_#000]">
                       <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">Campaign Yield</p>
                       <span className="text-lg md:text-xl font-black italic uppercase text-[#834bf1]">High Fidelity</span>
                    </div>
                 </div>

                 {selectedBrand.menu_link && (
                    <a href={selectedBrand.menu_link} target="_blank" rel="noreferrer" className="flex items-center justify-center space-x-4 md:space-x-6 w-full bg-black text-white font-black py-5 md:py-6 text-lg md:text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-[0.98]">
                       <span className="italic uppercase font-display">View Mission Assets</span>
                       <ArrowRight size={20} md:size={24} strokeWidth={4} />
                    </a>
                 )}
              </div>
           </div>
        </div>
      )}
    </section>
  );
};
