
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Users, CheckCircle, XCircle, Clock, Mail, Search, 
  ChevronRight, Filter, LogOut, MoreVertical, ExternalLink,
  Check, X, Trash2, Edit3, Send, Loader2
} from 'lucide-react';
import { EmailComposer } from './EmailComposer';

interface AdminDashboardProps {
  onLogout: () => void;
}

export interface Application {
  id: string;
  fullName: string;
  handle: string;
  email: string;
  phone: string;
  platform: string;
  niche: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  verifiedBy: string | null;
  verificationDate: any;
  emailSent: boolean;
  adminNotes: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'creator_applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const appRef = doc(db, 'creator_applications', id);
      await updateDoc(appRef, {
        status: newStatus,
        verifiedBy: auth.currentUser?.email,
        verificationDate: serverTimestamp()
      });
      // If success, we can trigger an email or notification
    } catch (error) {
      console.error("Update Status Error:", error);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Approved</span>;
      case 'rejected':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">R</div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Reelywood Admin</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Superuser Node: {auth.currentUser?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => { auth.signOut(); onLogout(); }}
            className="flex items-center space-x-2 text-white/40 hover:text-white transition-colors"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Apps', value: applications.length, icon: <Users />, color: 'text-indigo-400' },
            { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, icon: <Clock />, color: 'text-amber-400' },
            { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: <CheckCircle />, color: 'text-emerald-400' },
            { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: <XCircle />, color: 'text-rose-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 bg-white/5 rounded-2xl ${stat.color}`}>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, handle, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex items-center space-x-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Creator</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Platform</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Niche</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-white/20 font-bold uppercase tracking-widest">No matching applications found</td>
                  </tr>
                ) : (
                  filteredApps.map(app => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black text-xs uppercase">
                            {app.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{app.fullName}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{app.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{app.platform}</span>
                      </td>
                      <td className="p-6">
                        <p className="text-xs text-white/60">{app.niche}</p>
                      </td>
                      <td className="p-6 text-center">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end space-x-2">
                          {app.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(app.id, 'approved')}
                                className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(app.id, 'rejected')}
                                className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => { setSelectedApp(app); setIsEmailing(true); }}
                            className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
                            title="Send Email"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isEmailing && selectedApp && (
        <EmailComposer 
          application={selectedApp} 
          onClose={() => setIsEmailing(false)} 
        />
      )}
    </div>
  );
};
