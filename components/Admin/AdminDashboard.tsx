
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Users, CheckCircle, XCircle, Clock, Search, 
  Filter, LogOut, Send, Loader2, ArrowUpDown, RefreshCw,
  Plus, Target, Zap, Ticket, Check
} from 'lucide-react';

export interface Application {
  id: string;
  fullName: string;
  handle: string;
  platform: string;
  followers: string;
  status: string;
  userId?: string;
  email: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'missions' | 'vouchers'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'creator_applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApproveStatus = async (app: Application, newStatus: 'ACTIVE' | 'REJECTED') => {
    setIsProcessing(app.id);
    try {
      // 1. Update Firebase (Legacy/Real-time sync)
      const appRef = doc(db, 'creator_applications', app.id);
      await updateDoc(appRef, { status: newStatus === 'ACTIVE' ? 'approved' : 'rejected' });
      
      // 2. Update Postgres via Serverless API
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: app.userId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update Postgres database');
      
      alert(`Creator ${app.fullName} status updated to ${newStatus}.`);
    } catch (error: any) {
      console.error("Approval Error:", error);
      alert("Error updating record: " + error.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-indigo-500/30">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="w-10 h-10 rounded-xl bg-[#834bf1] flex items-center justify-center font-black">R</div>
          <nav className="flex items-center space-x-2">
            {[
              { id: 'applications', label: 'Apps', icon: <Users size={12}/> },
              { id: 'missions', label: 'Missions', icon: <Target size={12}/> },
              { id: 'vouchers', label: 'Vouchers', icon: <Ticket size={12}/> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <button onClick={onLogout} className="flex items-center space-x-2 text-white/40 hover:text-rose-400 transition-colors">
          <span className="text-[10px] font-black uppercase tracking-widest">Exit Terminal</span>
          <LogOut size={16} />
        </button>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'applications' ? (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic font-display">Identity Synchronization</h2>
              <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl">
                 {['all', 'pending', 'approved'].map(f => (
                   <button 
                    key={f} 
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusFilter === f ? 'bg-indigo-600 text-white' : 'text-white/40'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="p-6">Creator</th>
                    <th className="p-6">Platform</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.filter(a => statusFilter === 'all' || a.status === statusFilter).map(app => (
                    <tr key={app.id} className="hover:bg-white/[0.01]">
                      <td className="p-6">
                        <p className="font-black text-sm">{app.fullName}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{app.handle}</p>
                      </td>
                      <td className="p-6"><span className="text-[10px] font-black px-2 py-1 bg-white/5 rounded border border-white/10 uppercase">{app.platform}</span></td>
                      <td className="p-6 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        {app.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleApproveStatus(app, 'ACTIVE')}
                              disabled={!!isProcessing}
                              className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isProcessing === app.id ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                            </button>
                            <button 
                              onClick={() => handleApproveStatus(app, 'REJECTED')}
                              disabled={!!isProcessing}
                              className="bg-rose-500/10 text-rose-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-white/20"><CheckCircle size={18} className="ml-auto" /></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-10">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto">
               {activeTab === 'missions' ? <Target size={40} className="text-[#834bf1]" /> : <Ticket size={40} className="text-[#ffde59]" />}
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight italic font-display">{activeTab.toUpperCase()} Control</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest max-w-sm mx-auto">
                Admin-exclusive module for payload distribution.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
