
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { 
  Users, CheckCircle, XCircle, Clock, Mail, Search, 
  ChevronRight, Filter, LogOut, MoreVertical, ExternalLink,
  Check, X, Trash2, Edit3, Send, Loader2, ArrowUpDown, RefreshCw,
  Plus, Target, Zap
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
  followers: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  verifiedBy: string | null;
  verificationDate: any;
  emailSent: boolean;
  adminNotes: string;
  userId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'missions'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'followers'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);

  const LOGO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%281%29.mp4";

  const fetchApplications = () => {
    setRefreshing(true);
    const q = query(collection(db, 'creator_applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      setApplications(apps);
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchApplications();
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = () => {
    fetchApplications();
  };

  const handleStatusChange = async (app: Application, newStatus: 'approved' | 'rejected') => {
    try {
      const appRef = doc(db, 'creator_applications', app.id);
      await updateDoc(appRef, {
        status: newStatus,
        verifiedBy: auth.currentUser?.email,
        verificationDate: serverTimestamp()
      });

      // Update creator_cards collection for the dashboard to read
      if (app.userId) {
        const cardRef = doc(db, 'creator_cards', app.userId);
        await setDoc(cardRef, {
          userId: app.userId,
          status: newStatus,
          approvedAt: newStatus === 'approved' ? serverTimestamp() : null
        }, { merge: true });

        // Auto-create wallet if approved
        if (newStatus === 'approved') {
          const walletRef = doc(db, 'wallets', app.userId);
          await setDoc(walletRef, {
            userId: app.userId,
            balance: 0,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      }
    } catch (error) {
      console.error("Update Status Error:", error);
    }
  };

  const platforms = Array.from(new Set(applications.map(app => app.platform)));

  const filteredAndSortedApps = applications
    .filter(app => {
      const matchesSearch = 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPlatform = platformFilter === 'all' || app.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        const followersA = parseInt(a.followers) || 0;
        const followersB = parseInt(b.followers) || 0;
        return sortOrder === 'desc' ? followersB - followersA : followersA - followersB;
      }
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

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-black/5">
            <video 
              src={LOGO_URL} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Reelywood Admin</h1>
            <div className="flex items-center space-x-4 mt-1">
              <button 
                onClick={() => setActiveTab('applications')}
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'text-white/20 hover:text-white'}`}
              >
                Applications
              </button>
              <button 
                onClick={() => setActiveTab('missions')}
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${activeTab === 'missions' ? 'bg-indigo-600 text-white' : 'text-white/20 hover:text-white'}`}
              >
                Missions Control
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleManualRefresh}
            className={`p-2 rounded-full hover:bg-white/5 transition-all ${refreshing ? 'animate-spin text-indigo-400' : 'text-white/40'}`}
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <div className="h-8 w-px bg-white/10"></div>
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
        {activeTab === 'applications' ? (
          <>
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

            <div className="flex flex-col space-y-4">
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

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/10">
                  <Filter size={14} className="text-white/40" />
                  <select 
                    value={platformFilter} 
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#0a0a0a]">All Platforms</option>
                    {platforms.map(p => (
                      <option key={p} value={p} className="bg-[#0a0a0a]">{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/10">
                    <ArrowUpDown size={14} className="text-white/40" />
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                    >
                      <option value="date" className="bg-[#0a0a0a]">Sort by Date</option>
                      <option value="followers" className="bg-[#0a0a0a]">Sort by Followers</option>
                    </select>
                    <button 
                      onClick={toggleSortOrder}
                      className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors text-[10px] font-black"
                    >
                      {sortOrder.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Creator</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Platform</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Followers</th>
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
                    ) : filteredAndSortedApps.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-white/20 font-bold uppercase tracking-widest">No matching applications found</td>
                      </tr>
                    ) : (
                      filteredAndSortedApps.map(app => (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black text-xs uppercase overflow-hidden">
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
                            <p className="text-xs font-black text-indigo-400">{parseInt(app.followers).toLocaleString()}</p>
                          </td>
                          <td className="p-6 text-center">
                            {getStatusBadge(app.status)}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-end space-x-2">
                              {app.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusChange(app, 'approved')}
                                    className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                                    title="Approve"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(app, 'rejected')}
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
          </>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Mission Lab</h2>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Create and deploy creator campaigns</p>
              </div>
              <button className="flex items-center space-x-3 bg-white text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                <Plus size={18} />
                <span>New Mission</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Cabin17A Launch", reward: "500 RC", creators: 12, status: "Active" },
                { title: "Kolkata Food Fest", reward: "300 RC", creators: 45, status: "Draft" },
                { title: "App Launch Blast", reward: "1000 RC", creators: 0, status: "Upcoming" }
              ].map((m, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Target size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5 text-white/40">{m.status}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">{m.title}</h3>
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Reward Pool</p>
                        <p className="text-indigo-400 font-black">{m.reward}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Creators</p>
                        <p className="text-white font-black">{m.creators}</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all">
                    Manage Assignments
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
