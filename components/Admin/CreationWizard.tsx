
import React, { useState } from 'react';
import { supabase } from '../../lib/clients';
import { Users, Globe, Search, CheckCircle, X, Loader2, Zap, Gift, Target } from 'lucide-react';

interface CreationWizardProps {
  type: 'mission' | 'voucher';
  users: any[];
  brands: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreationWizard: React.FC<CreationWizardProps> = ({ type, users, brands, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1 = Details, 2 = Targeting
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Targeting State
  const [targetMode, setTargetMode] = useState<'global' | 'single' | 'multi'>('global');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    value: '', // Reward for mission, Cost for voucher
    brand_id: '',
    description: '',
    code: '', // Only for voucher
    checkpoints: ['', '', ''] // Only for mission
  });

  const handleToggleUser = (uid: string) => {
    if (targetMode === 'single') {
      setSelectedUserIds([uid]);
    } else {
      setSelectedUserIds(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
    }
  };

  const handleDeploy = async () => {
    if (!supabase) return;
    
    // Safety check: Don't allow empty targeting if not global
    if (targetMode !== 'global' && selectedUserIds.length === 0) {
      alert("⚠️ TARGET ERROR: Please select at least one agent node.");
      return;
    }

    setLoading(true);

    try {
      // STRICT PAYLOAD: Global uses empty array, targeted uses selected UIDs
      const assignedTo = targetMode === 'global' ? [] : [...selectedUserIds];
      const brand = brands.find(b => b.id === formData.brand_id);
      
      let table = '';
      let payload = {};

      if (type === 'mission') {
        table = 'missions';
        payload = {
          title: formData.title,
          description: formData.description || 'New operation available.',
          reward_amount: parseInt(formData.value),
          brand_id: formData.brand_id,
          location: brand?.location_text || 'Global Sync',
          image_url: brand?.cover_image_url || '',
          checkpoints: formData.checkpoints.filter(c => c),
          assigned_to: assignedTo
        };
      } else {
        table = 'rewards';
        payload = {
          title: formData.title,
          cost: parseInt(formData.value),
          description: formData.description,
          code: formData.code || 'GENERATED-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          brand_id: formData.brand_id,
          assigned_to: assignedTo
        };
      }

      const { error } = await supabase.from(table).insert([payload]);
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Deployment Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsStep = () => (
    <div className="space-y-6 animate-in slide-in-from-right">
      <h3 className="text-xl font-black uppercase italic flex items-center gap-2 text-black">
        {type === 'mission' ? <Zap className="text-[#834bf1]" /> : <Gift className="text-[#ffde59]" />}
        Step 1: Protocol Details
      </h3>
      
      <div>
        <label className="text-[10px] font-black uppercase opacity-50 text-black">Alliance Brand</label>
        <select 
          className="w-full p-4 bg-white border-4 border-black font-bold text-sm text-black"
          value={formData.brand_id}
          onChange={e => setFormData({...formData, brand_id: e.target.value})}
        >
          <option value="">-- Select Brand --</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase opacity-50 text-black">{type === 'mission' ? 'Mission Title' : 'Voucher Name'}</label>
        <input 
          className="w-full p-4 border-4 border-black font-bold text-black"
          placeholder={type === 'mission' ? "e.g. VISUAL CAPTURE: CAFE" : "e.g. 50% OFF LATTE"}
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="text-[10px] font-black uppercase opacity-50 text-black">{type === 'mission' ? 'Reward (RC)' : 'Cost (RC)'}</label>
           <input type="number" className="w-full p-4 border-4 border-black font-bold text-black" placeholder="000"
             value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}/>
        </div>
        {type === 'voucher' && (
           <div>
             <label className="text-[10px] font-black uppercase opacity-50 text-black">Redeem Code</label>
             <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="AUTO-GEN"
               value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}/>
           </div>
        )}
      </div>

      <textarea 
        className="w-full p-4 border-4 border-black font-bold resize-none h-24 text-black" 
        placeholder="Briefing / Description..."
        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
      />

      <button 
        disabled={!formData.title || !formData.brand_id || !formData.value}
        onClick={() => setStep(2)}
        className="w-full py-4 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-[#834bf1] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Proceed to Targeting
      </button>
    </div>
  );

  const renderTargetingStep = () => (
    <div className="space-y-6 animate-in slide-in-from-right h-full flex flex-col">
      <h3 className="text-xl font-black uppercase italic flex items-center gap-2 text-black">
        <Target className="text-rose-500" />
        Step 2: Deployment Target
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {['global', 'single', 'multi'].map((m) => (
          <button 
            key={m}
            onClick={() => { setTargetMode(m as any); setSelectedUserIds([]); }}
            className={`p-2 border-2 border-black font-black uppercase text-[10px] transition-all ${targetMode === m ? 'bg-black text-white' : 'bg-white text-black opacity-50'}`}
          >
            {m === 'global' ? 'Global (All)' : m === 'single' ? 'Single Node' : 'Multi Node'}
          </button>
        ))}
      </div>

      {targetMode === 'global' ? (
        <div className="flex-1 flex flex-col items-center justify-center border-4 border-black border-dashed bg-slate-50 p-8 text-center opacity-50 text-black">
           <Globe size={48} className="mb-4" />
           <p className="font-black uppercase text-sm">Global Broadcast</p>
           <p className="text-xs">This protocol will be deployed to all {users.length} active nodes.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 border-4 border-black bg-white">
           <div className="p-2 border-b-2 border-black flex items-center gap-2 bg-slate-50 text-black">
              <Search size={14} />
              <input 
                className="w-full font-bold text-xs uppercase outline-none bg-transparent" 
                placeholder="Search Agent..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              {users.filter(u => u.display_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => {
                const isSelected = selectedUserIds.includes(u.firebase_uid);
                return (
                  <div key={u.id} 
                    onClick={() => handleToggleUser(u.firebase_uid)}
                    className={`p-3 border-2 cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'bg-[#ffde59] border-black shadow-[2px_2px_0px_0px_#000]' : 'border-slate-100 hover:border-black'} text-black`}
                  >
                     <div className="min-w-0">
                       <div className="font-bold text-xs uppercase truncate">{u.display_name}</div>
                       <div className="text-[8px] font-mono opacity-50 truncate">{u.email}</div>
                     </div>
                     {isSelected && <CheckCircle size={16} className="shrink-0" />}
                  </div>
                )
              })}
           </div>
           <div className="p-2 bg-slate-100 border-t-2 border-black text-center text-[10px] font-black uppercase text-black">
              {selectedUserIds.length} Nodes Targeted
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <button onClick={() => setStep(1)} className="py-4 border-4 border-black font-black uppercase text-xs text-black">Back</button>
        <button 
          onClick={handleDeploy}
          disabled={loading || (targetMode !== 'global' && selectedUserIds.length === 0)}
          className="py-4 bg-[#39ff14] text-black border-4 border-black font-black uppercase text-xs hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIATE DEPLOY"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white w-full max-w-lg h-[650px] border-4 border-black shadow-[12px_12px_0px_0px_#834bf1] flex flex-col">
          <div className="p-4 border-b-4 border-black flex justify-between items-center bg-slate-50 text-black">
             <h2 className="font-black uppercase italic text-lg">
               Create {type === 'mission' ? 'Mission' : 'Voucher'}
             </h2>
             <button onClick={onClose} className="hover:bg-rose-500 hover:text-white p-1 border-2 border-transparent hover:border-black transition-all">
               <X size={20} />
             </button>
          </div>
          <div className="flex-1 p-6 overflow-hidden bg-white">
             {step === 1 ? renderDetailsStep() : renderTargetingStep()}
          </div>
       </div>
    </div>
  );
};
