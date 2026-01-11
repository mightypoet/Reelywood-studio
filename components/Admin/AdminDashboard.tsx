
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Server, Zap, List, Activity, 
  Box, Terminal, LogOut, FileText, CheckCircle, 
  Loader2, Trash2, CheckSquare, Crosshair, 
  Instagram, Youtube, Twitter, MapPin, Globe
} from 'lucide-react';

// --- TYPES ---
export type Tab = 'COMMAND' | 'QUEUED' | 'ALLIANCE' | 'CONSOLE' | 'VAULT' | 'LEDGER';
export type TargetMode = 'ALL' | 'SELECT';

export interface Agent {
  id: string;
  name: string;
  username: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'BANNED';
  missions_done: number;
  rc_inflow: number;
  rc_outflow: number;
  followers: string;
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER';
  niche: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  status: 'ONLINE' | 'OFFLINE';
  logo: string;
  location: string;
  cover: string;
}

export interface DeployedItem {
  id: string;
  type: 'MISSION' | 'VOUCHER';
  title: string;
  bounty: string;
  brandName: string;
  brandLogo: string;
  brandLocation: string;
  brandCover: string;
  targetAudience: string[]; // List of Agent IDs or ['GLOBAL']
  status: 'LIVE' | 'PROCESSING';
}

// --- MOCK DATA ---
const MOCK_AGENTS: Agent[] = [
  { id: '01', name: 'ROHAN SEN', username: '@rohan_sen', email: 'rohan@reelywood.com', status: 'ACTIVE', missions_done: 42, rc_inflow: 15000, rc_outflow: 4200, followers: '12.5K', platform: 'INSTAGRAM', niche: 'LIFESTYLE' },
  { id: '02', name: 'SARAH JENKINS', username: '@sarah.j_vlogs', email: 'sarah.j@gmail.com', status: 'ACTIVE', missions_done: 15, rc_inflow: 5000, rc_outflow: 1200, followers: '450K', platform: 'YOUTUBE', niche: 'TECH' },
  { id: '03', name: 'MIKE TYSON', username: '@iron_mike', email: 'mike@box.com', status: 'BANNED', missions_done: 8, rc_inflow: 2400, rc_outflow: 0, followers: '1.2M', platform: 'TWITTER', niche: 'SPORTS' },
  { id: '04', name: 'PRIYA DAS', username: '@priya.style', email: 'priya@yahoo.com', status: 'ACTIVE', missions_done: 65, rc_inflow: 32000, rc_outflow: 28000, followers: '89K', platform: 'INSTAGRAM', niche: 'FASHION' },
  { id: '05', name: 'ALEX CHEN', username: '@chen_codes', email: 'alex.c@tech.io', status: 'ACTIVE', missions_done: 12, rc_inflow: 8000, rc_outflow: 1000, followers: '22K', platform: 'YOUTUBE', niche: 'EDUCATION' },
];

const MOCK_BRANDS: Brand[] = [
  { 
    id: 'b1', name: 'Cabin 17A', category: 'Cafe', status: 'ONLINE', 
    location: 'Kolkata, Lake Terrace',
    logo: 'https://ui-avatars.com/api/?name=C+17&background=000&color=fff&size=128', 
    cover: 'cover_cabin.jpg' 
  },
  { 
    id: 'b2', name: 'Cup e Bong', category: 'Restaurant', status: 'ONLINE', 
    location: 'Hindustan Park, Kolkata',
    logo: 'https://ui-avatars.com/api/?name=C+B&background=10B981&color=fff&size=128',
    cover: 'cover_cup.jpg'
  },
  { 
    id: 'b3', name: 'Nike', category: 'Retail', status: 'OFFLINE', 
    location: 'South City Mall',
    logo: 'https://ui-avatars.com/api/?name=NIKE&background=000&color=fff&size=128',
    cover: 'cover_nike.jpg'
  },
];

const INITIAL_DEPLOYMENTS: DeployedItem[] = [
  { 
    id: 'm1', type: 'MISSION', title: 'VISIT CABIN 17A', bounty: '800', status: 'LIVE', 
    brandName: 'Cabin 17A', brandLocation: 'Kolkata, Lake Terrace', 
    brandLogo: 'https://ui-avatars.com/api/?name=C+17&background=000&color=fff&size=128',
    brandCover: '',
    targetAudience: ['GLOBAL'] 
  },
];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('CONSOLE');
  const [agents] = useState<Agent[]>(MOCK_AGENTS);
  
  // Deployment State
  const [activeDeployments, setActiveDeployments] = useState<DeployedItem[]>(INITIAL_DEPLOYMENTS);
  const [isDeploying, setIsDeploying] = useState(false);

  // Forms
  const [missionForm, setMissionForm] = useState({ brandId: '', title: '', bounty: '' });
  const [voucherForm, setVoucherForm] = useState({ brandId: '', title: '', cost: '', code: '' });

  // Targeting Logic
  const [targetMode, setTargetMode] = useState<TargetMode>('ALL');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  // --- HELPERS ---

  const toggleAgent = (id: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const deployItem = (type: 'MISSION' | 'VOUCHER') => {
    const form = type === 'MISSION' ? missionForm : voucherForm;
    const bountyValue = type === 'MISSION' ? missionForm.bounty : voucherForm.cost;
    
    // 1. Validation
    if (!form.brandId || !form.title || !bountyValue) {
      alert("⚠️ SYSTEM ERROR: ALL FIELDS REQUIRED");
      return;
    }
    
    // 2. Target Validation
    if (targetMode === 'SELECT' && selectedAgentIds.length === 0) {
      alert("⚠️ TARGET ERROR: NO AGENTS SELECTED. SELECT AGENTS OR SWITCH TO GLOBAL.");
      return;
    }

    setIsDeploying(true);

    setTimeout(() => {
      // 3. Fetch Full Brand Details (Simulating DB Lookup)
      const brandData = MOCK_BRANDS.find(b => b.id === form.brandId);
      
      // 4. DETERMINE TARGET AUDIENCE
      const finalTarget = targetMode === 'ALL' ? ['GLOBAL'] : [...selectedAgentIds];

      const newItem: DeployedItem = {
        id: Date.now().toString(),
        type,
        title: form.title,
        bounty: bountyValue,
        status: 'LIVE',
        brandName: brandData?.name || 'UNKNOWN',
        brandLogo: brandData?.logo || '',
        brandLocation: brandData?.location || 'Unknown Location',
        brandCover: brandData?.cover || '',
        targetAudience: finalTarget
      };

      // 5. Update State
      setActiveDeployments([newItem, ...activeDeployments]);
      
      // 6. Reset Forms
      setMissionForm({ brandId: '', title: '', bounty: '' });
      setVoucherForm({ brandId: '', title: '', cost: '', code: '' });
      setIsDeploying(false);
    }, 1500);
  };

  const deleteItem = (id: string) => {
    setActiveDeployments(activeDeployments.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-mono text-black selection:bg-purple-500 selection:text-white pb-20">
      
      {/* --- TOP BAR --- */}
      <div className="bg-white border-b-4 border-black p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 flex items-center justify-center border-2 border-black">
            <Terminal className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-gray-800">
            TERMINAL <span className="text-gray-400">ADMIN</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-green-600 animate-pulse">
            <Activity className="w-4 h-4"/> SYSTEM LIVE
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 border-2 border-black bg-black text-white font-bold uppercase flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            EXIT <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-8">

        {/* --- METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard label="AGENTS" value="05" icon={<Users className="w-6 h-6"/>} />
          <MetricCard label="PENDING" value="01" icon={<Search className="w-6 h-6"/>} />
          <MetricCard label="ALLIANCE" value="03" icon={<Server className="w-6 h-6"/>} />
          <MetricCard label="MISSIONS" value={activeDeployments.length.toString().padStart(2, '0')} icon={<Zap className="w-6 h-6"/>} />
          <MetricCard label="QUEUED" value="00" icon={<List className="w-6 h-6"/>} />
          <MetricCard label="TX VOLUME" value="14" icon={<Activity className="w-6 h-6"/>} />
        </div>

        {/* --- NAVIGATION --- */}
        <div className="bg-white border-4 border-black p-2 flex flex-wrap gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <NavButton active={activeTab === 'COMMAND'} onClick={() => setActiveTab('COMMAND')} icon={<Users/>} label="COMMAND" />
          <NavButton active={activeTab === 'QUEUED'} onClick={() => setActiveTab('QUEUED')} icon={<List/>} label="QUEUED" />
          <NavButton active={activeTab === 'ALLIANCE'} onClick={() => setActiveTab('ALLIANCE')} icon={<Server/>} label="ALLIANCE" />
          <NavButton active={activeTab === 'CONSOLE'} onClick={() => setActiveTab('CONSOLE')} icon={<Zap/>} label="CONSOLE" />
          <NavButton active={activeTab === 'VAULT'} onClick={() => setActiveTab('VAULT')} icon={<Box/>} label="VAULT" />
          <NavButton active={activeTab === 'LEDGER'} onClick={() => setActiveTab('LEDGER')} icon={<FileText/>} label="LEDGER" />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="bg-white border-4 border-black min-h-[600px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
          
          {activeTab === 'COMMAND' && (
            <div>
              <div className="flex justify-between items-end mb-6 border-b-4 border-black pb-4">
                <div>
                  <h2 className="text-4xl font-black italic uppercase">AGENT NETWORK</h2>
                  <p className="font-bold text-gray-500 mt-1">NODE DIRECTORY • FINANCIAL ACTIVITY</p>
                </div>
                <div className="bg-yellow-300 px-4 py-2 border-2 border-black font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  TOTAL NODES: {agents.length}
                </div>
              </div>

              <div className="overflow-x-auto border-2 border-black">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-4 font-black uppercase">Identity</th>
                      <th className="p-4 font-black uppercase text-center">Missions</th>
                      <th className="p-4 font-black uppercase text-right text-green-400">Inflow</th>
                      <th className="p-4 font-black uppercase text-right text-red-400">Outflow</th>
                      <th className="p-4 font-black uppercase text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold text-sm">
                    {agents.map((agent, idx) => (
                      <tr key={agent.id} className={`border-b-2 border-black hover:bg-yellow-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-4 border-r-2 border-black">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 text-white border-2 border-black flex items-center justify-center font-black text-lg">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-lg uppercase">{agent.name}</div>
                              <div className="text-gray-500 text-xs uppercase">{agent.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-r-2 border-black text-center text-xl font-black italic">{agent.missions_done}</td>
                        <td className="p-4 border-r-2 border-black text-right text-green-600 text-lg font-black">+{agent.rc_inflow.toLocaleString()}</td>
                        <td className="p-4 border-r-2 border-black text-right text-red-600 text-lg font-black">-{agent.rc_outflow.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 border-2 border-black text-xs font-black uppercase ${agent.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}>
                            {agent.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CONSOLE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-2">
                  <span className="text-purple-600">+</span> MISSION CONSOLE
                </h2>
                <div className="space-y-6 flex-1 bg-white p-1">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">LINK ECOSYSTEM PARTNER</label>
                    <select 
                      className="w-full border-4 border-black p-4 font-bold text-lg uppercase outline-none focus:bg-yellow-50"
                      value={missionForm.brandId}
                      onChange={(e) => setMissionForm({...missionForm, brandId: e.target.value})}
                    >
                      <option value="">-- SELECT ACTIVE NODE --</option>
                      {MOCK_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name} ({b.location})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">OBJECTIVE HEADER</label>
                    <input 
                      className="w-full border-4 border-black p-4 font-bold text-lg outline-none focus:bg-yellow-50"
                      placeholder="e.g. POST A REEL"
                      value={missionForm.title}
                      onChange={(e) => setMissionForm({...missionForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">REWARD (RC)</label>
                    <input 
                      type="number"
                      className="w-full border-4 border-black p-4 font-bold text-lg outline-none focus:bg-yellow-50"
                      placeholder="000"
                      value={missionForm.bounty}
                      onChange={(e) => setMissionForm({...missionForm, bounty: e.target.value})}
                    />
                  </div>
                  
                  <TargetSelector 
                    agents={agents} 
                    targetMode={targetMode} 
                    setTargetMode={setTargetMode} 
                    selectedIds={selectedAgentIds} 
                    toggleId={toggleAgent} 
                  />

                  <button 
                    onClick={() => deployItem('MISSION')}
                    disabled={isDeploying}
                    className={`w-full text-white border-4 border-black py-5 font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2
                      ${isDeploying ? 'bg-gray-400' : 'bg-[#834bf1] hover:bg-purple-600'}`}
                  >
                    {isDeploying ? <Loader2 className="w-6 h-6 animate-spin"/> : "DEPLOY MISSION PROTOCOL"}
                  </button>
                </div>
              </div>
              
              <ActiveSyncGrid deployments={activeDeployments} onDelete={deleteItem} />
            </div>
          )}

          {activeTab === 'VAULT' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col h-full">
                 <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-2">
                  <Box className="text-blue-600" /> MINT VOUCHER
                </h2>
                <div className="space-y-6 flex-1 bg-white p-1">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">LINK ECOSYSTEM PARTNER</label>
                    <select 
                      className="w-full border-4 border-black p-4 font-bold text-lg uppercase outline-none focus:bg-yellow-50"
                      value={voucherForm.brandId}
                      onChange={(e) => setVoucherForm({...voucherForm, brandId: e.target.value})}
                    >
                      <option value="">-- SELECT BRAND --</option>
                      {MOCK_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name} ({b.location})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">INVENTORY LABEL</label>
                    <input 
                      className="w-full border-4 border-black p-4 font-bold text-lg outline-none"
                      placeholder="VOUCHER NAME"
                      value={voucherForm.title}
                      onChange={(e) => setVoucherForm({...voucherForm, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2">COST (RC)</label>
                      <input className="w-full border-4 border-black p-4 font-bold text-lg outline-none" placeholder="500" value={voucherForm.cost} onChange={(e) => setVoucherForm({...voucherForm, cost: e.target.value})} />
                     </div>
                     <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2">HASH CODE</label>
                      <input className="w-full border-4 border-black p-4 font-bold text-lg outline-none" placeholder="RW-XXX" value={voucherForm.code} onChange={(e) => setVoucherForm({...voucherForm, code: e.target.value})} />
                     </div>
                  </div>

                  <TargetSelector 
                    agents={agents} 
                    targetMode={targetMode} 
                    setTargetMode={setTargetMode} 
                    selectedIds={selectedAgentIds} 
                    toggleId={toggleAgent} 
                  />

                  <button 
                    onClick={() => deployItem('VOUCHER')}
                    disabled={isDeploying}
                    className={`w-full text-white border-4 border-black py-5 font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2
                      ${isDeploying ? 'bg-gray-400' : 'bg-[#ffde59] text-black hover:bg-yellow-500'}`}
                  >
                    {isDeploying ? <Loader2 className="w-6 h-6 animate-spin"/> : "AUTHORIZE INVENTORY"}
                  </button>
                </div>
              </div>

              <ActiveSyncGrid deployments={activeDeployments} onDelete={deleteItem} />
            </div>
          )}

          {(activeTab === 'QUEUED' || activeTab === 'ALLIANCE' || activeTab === 'LEDGER') && (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
               <Activity className="w-16 h-16 mb-4 animate-pulse" />
               <h3 className="font-black text-2xl uppercase">MODULE ONLINE: {activeTab}</h3>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function TargetSelector({ agents, targetMode, setTargetMode, selectedIds, toggleId }: any) {
  return (
    <div className="bg-gray-50 border-4 border-black p-4">
      <label className="block text-xs font-black uppercase text-black mb-3 flex items-center gap-2">
        <Crosshair className="w-4 h-4" /> DEPLOYMENT TARGET
      </label>
      <div className="flex gap-2 mb-4">
          <button onClick={() => setTargetMode('ALL')} className={`flex-1 py-3 font-black text-xs uppercase border-2 border-black ${targetMode === 'ALL' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>GLOBAL</button>
          <button onClick={() => setTargetMode('SELECT')} className={`flex-1 py-3 font-black text-xs uppercase border-2 border-black ${targetMode === 'SELECT' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>SELECTIVE</button>
      </div>
      {targetMode === 'SELECT' && (
        <div className="bg-white border-2 border-black max-h-[250px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-black sticky top-0 z-10">
              <tr>
                <th className="p-2 border-b-2 border-black w-8"></th>
                <th className="p-2 border-b-2 border-black text-[10px] font-black uppercase">Agent</th>
                <th className="p-2 border-b-2 border-black text-[10px] font-black uppercase">Followers</th>
                <th className="p-2 border-b-2 border-black text-[10px] font-black uppercase">Plat</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold">
              {agents.map((agent: Agent) => {
                const isSelected = selectedIds.includes(agent.id);
                return (
                  <tr key={agent.id} onClick={() => toggleId(agent.id)} className={`cursor-pointer border-b border-gray-100 hover:bg-purple-50 ${isSelected ? 'bg-yellow-50' : ''}`}>
                    <td className="p-2 text-center">
                      <div className={`w-4 h-4 border-2 border-black flex items-center justify-center ${isSelected ? 'bg-black' : 'bg-white'}`}>
                        {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                      </div>
                    </td>
                    <td className="p-2 uppercase">{agent.name}<br/><span className="text-gray-400 text-[10px]">{agent.niche}</span></td>
                    <td className="p-2">{agent.followers}</td>
                    <td className="p-2">
                       {agent.platform === 'INSTAGRAM' && <Instagram className="w-4 h-4 text-pink-600"/>}
                       {agent.platform === 'YOUTUBE' && <Youtube className="w-4 h-4 text-red-600"/>}
                       {agent.platform === 'TWITTER' && <Twitter className="w-4 h-4 text-blue-400"/>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActiveSyncGrid({ deployments, onDelete }: { deployments: DeployedItem[], onDelete: (id: string) => void }) {
  return (
    <div className="bg-gray-100 border-4 border-black p-6 h-full min-h-[500px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
          <h3 className="font-black italic uppercase text-xl">ACTIVE SYNC GRID (USER VIEW)</h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase text-gray-400">LIVE FEED</span>
          </div>
      </div>
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {deployments.map((item) => (
            <div key={item.id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4">
               <div className="w-16 h-16 border-2 border-black bg-gray-200 overflow-hidden shrink-0">
                  <img src={item.brandLogo} alt="brand" className="w-full h-full object-cover"/>
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase border border-black px-1 ${item.targetAudience.includes('GLOBAL') ? 'bg-green-400' : 'bg-yellow-400'}`}>
                          {item.targetAudience.includes('GLOBAL') ? 'GLOBAL' : `TARGETED [${item.targetAudience.length}]`}
                        </span>
                        <span className="bg-purple-600 text-white text-[10px] font-black uppercase px-1 border border-black">
                          {item.type}
                        </span>
                      </div>
                      <h4 className="font-black italic text-lg mt-1 uppercase leading-tight">{item.title}</h4>
                      <p className="text-xs font-bold text-gray-500 uppercase mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3"/> {item.brandLocation}
                      </p>
                    </div>
                    <div className="text-right">
                       <div className="font-black text-xl text-purple-600">+{item.bounty} RC</div>
                       <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700 mt-2"><Trash2 className="w-4 h-4"/></button>
                    </div>
                 </div>
               </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: any) {
  return (
    <div className="bg-white border-4 border-black p-4 flex justify-between items-start shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div>
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</h3>
        <p className="text-4xl font-black italic">{value}</p>
      </div>
      <div className="text-gray-300">{icon}</div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 min-w-[140px] py-4 px-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all border-2 border-transparent
        ${active ? 'bg-[#834bf1] text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-black'}
      `}
    >
      {icon} {label}
    </button>
  );
}
