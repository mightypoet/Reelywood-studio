
import React, { useState, useEffect } from 'react';
import { fetchPendingUsers, approveUser, createAndAssignMission } from '../../services/backend';
import { 
  Users, Target, Ticket, LogOut, Loader2, CheckCircle, 
  Plus, Zap, ShieldCheck, Mail, Clock, AlertCircle
} from 'lucide-react';

// Added Application interface to fix the import error in EmailComposer.tsx
export interface Application {
  id: string;
  fullName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'missions' | 'vouchers'>('applications');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadRequests();
    }
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingUsers();
      setRequests(data || []);
    } catch (err) {
      console.error("Transmission Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string) => {
    setIsProcessing(uid);
    try {
      await approveUser(uid);
      setRequests(prev => prev.filter(r => r.firebase_uid !== uid));
      alert("Identity Node Authorized Successfully.");
    } catch (err: any) {
      alert("Authorization Failed: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateMission = async () => {
    const title = prompt("Enter Mission Title:");
    const reward = parseInt(prompt("Enter Reelcoin Reward:") || "0");
    
    if (title && reward) {
      try {
        const mission = await createAndAssignMission({ title, reward });
        alert(`Mission "${mission.title}" deployed to the network.`);
      } catch (e) {
        alert("Mission deployment failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <div className="w-10 h-10 rounded-xl bg-[#834bf1] flex items-center justify-center font-black italic text-xl border border-white/10">R</div>
          <nav className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'applications', label: 'Requests', icon: <Users size={14}/> },
              { id: 'missions', label: 'Missions', icon: <Target size={14}/> },
              { id: 'vouchers', label: 'Vouchers', icon: <Ticket size={14}/> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <button onClick={onLogout} className="flex items-center space-x-3 text-white/40 hover:text-rose-400 transition-colors bg-white/5 px-5 py-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
          <LogOut size={16} />
        </button>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'applications' ? (
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic font-display">Sync Terminal</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Verify and authorize pending creator identities.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
              {loading ? (
                <div className="p-24 text-center">
                  <Loader2 className="animate-spin text-[#834bf1] mx-auto mb-4" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Fetching Nodes...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-24 text-center opacity-30">
                  <ShieldCheck size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Grid Synchronized</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 border-b border-white/5">
                    <tr>
                      <th className="p-8">Agent Identity</th>
                      <th className="p-8 text-center">Protocol</th>
                      <th className="p-8 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {requests.map(user => (
                      <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-8">
                          <p className="font-black text-lg text-white group-hover:text-[#834bf1] transition-colors">{user.email || 'Anonymous'}</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{user.firebase_uid}</p>
                        </td>
                        <td className="p-8 text-center">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 animate-pulse">
                            PENDING_AUTH
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <button 
                            onClick={() => handleApprove(user.firebase_uid)}
                            disabled={!!isProcessing}
                            className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2 ml-auto shadow-xl"
                          >
                            {isProcessing === user.firebase_uid ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                            <span>Authorize</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center space-y-12">
             <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl relative">
              <div className="absolute inset-0 bg-[#834bf1]/10 blur-2xl rounded-full"></div>
              {activeTab === 'missions' ? <Target size={56} className="text-[#834bf1] relative z-10" /> : <Ticket size={56} className="text-[#ffde59] relative z-10" />}
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tight italic font-display">{activeTab} Control</h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
                Execute payload deployment across verified network nodes.
              </p>
            </div>
            <div className="flex justify-center pt-8">
              <button 
                onClick={activeTab === 'missions' ? handleCreateMission : () => alert('Voucher deployment enabled.')}
                className={`flex items-center space-x-6 px-12 py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl border ${
                  activeTab === 'missions' ? 'bg-[#834bf1] border-[#834bf1]/50 shadow-indigo-500/20' : 'bg-[#ffde59] text-black border-[#ffde59]/50 shadow-yellow-500/20'
                }`}
              >
                <Plus size={20} strokeWidth={3} />
                <span>Initialize Protocol</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
