
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, getDocs } from 'firebase/firestore';
import { 
  Users, CheckCircle, XCircle, Clock, Mail, Search, 
  ChevronRight, Filter, LogOut, MoreVertical, ExternalLink,
  Check, X, Trash2, Edit3, Send, Loader2, ArrowUpDown, RefreshCw,
  Plus, Target, Gift, LayoutDashboard
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
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'creators' | 'missions'>('creators');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);

  // Mission State
  const [missionForm, setMissionForm] = useState({ brand: '', task: '', reward: '', deadline: '' });

  const LOGO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%281%29.mp4";

  useEffect(() => {
    const q = query(collection(db, 'creators'), orderBy('createdAt', 'desc'));
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

  const handleStatusChange = async (uid: string, newStatus: 'approved' | 'rejected') => {
    try {
      const creatorRef = doc(db, 'creators', uid);
      await updateDoc(creatorRef, {
        cardStatus: newStatus,
        verifiedBy: auth.currentUser?.email,
        verificationDate: serverTimestamp()
      });

      const cardRef = doc(db, 'creatorCards', uid);
      await updateDoc(cardRef, {
        status: newStatus,
        approvedAt: newStatus === 'approved' ? serverTimestamp() : null
      });
    } catch (error) {
      console.error("Update Status Error:", error);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const missionId = `mission-${Date.now()}`;
      await setDoc(doc(db, 'missions', missionId), {
        ...missionForm,
        reward: Number(missionForm.reward),
        createdAt: serverTimestamp(),
        assignedTo: 'all_approved' // Demo logic: Assigns to all approved
      });
      setMissionForm({ brand: '', task: '', reward: '', deadline: '' });
      alert("Mission deployed across approved nodes.");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter(app => 
    app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.handle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col font-display">
      <header className="h-20 border-b-[4px] border-black flex items-center justify-between px-8 bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="w-10 h-10 border-[3px] border-black overflow-hidden">
            <video src={LOGO_URL} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
          <h1 className="text-sm font-black uppercase tracking-widest">Reelywood Terminal</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 border-[2px] border-black">
            <button onClick={() => setActiveTab('creators')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'creators' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}>Creators</button>
            <button onClick={() => setActiveTab('missions')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'missions' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}>Missions</button>
          </div>
          <button onClick={() => { auth.signOut(); onLogout(); }} className="w-10 h-10 border-[3px] border-black bg-[#ffde59] flex items-center justify-center shadow-[3px_3px_0px_#000] active:shadow-none transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
        {activeTab === 'creators' ? (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <h2 className="text-5xl font-black uppercase tracking-tighter">Creator Queue</h2>
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search parameters..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-[3px] border-black p-4 pl-12 focus:outline-none shadow-[4px_4px_0px_#000]"
                  />
               </div>
            </div>

            <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-[4px] border-black">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest">Identity</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest">Reach</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[2px] divide-black/10">
                    {filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                          <p className="font-black uppercase text-sm">{app.fullName}</p>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{app.handle}</p>
                        </td>
                        <td className="p-6">
                          <p className="font-black text-purple">{parseInt(app.followers).toLocaleString()}</p>
                        </td>
                        <td className="p-6 text-center">
                          <span className={`px-4 py-1.5 border-[2px] border-black font-black text-[9px] uppercase tracking-widest ${app.status === 'approved' ? 'bg-emerald-400' : app.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'}`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-end space-x-3">
                             <button onClick={() => handleStatusChange(app.id, 'approved')} className="w-9 h-9 border-[2px] border-black bg-emerald-400 flex items-center justify-center hover:translate-y-[-2px] transition-all"><Check size={16}/></button>
                             <button onClick={() => handleStatusChange(app.id, 'rejected')} className="w-9 h-9 border-[2px] border-black bg-rose-400 flex items-center justify-center hover:translate-y-[-2px] transition-all"><X size={16}/></button>
                             <button onClick={() => { setSelectedApp(app); setIsEmailing(true); }} className="w-9 h-9 border-[2px] border-black bg-white flex items-center justify-center hover:translate-y-[-2px] transition-all"><Mail size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
               <h2 className="text-4xl font-black uppercase tracking-tighter">Deploy Mission</h2>
               <form onSubmit={handleCreateMission} className="bg-white border-[4px] border-black p-8 shadow-[12px_12px_0px_#000] space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Brand Entity</label>
                    <input required value={missionForm.brand} onChange={e => setMissionForm({...missionForm, brand: e.target.value})} className="w-full border-[3px] border-black p-4 text-xs font-black uppercase focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Task Payload</label>
                    <textarea required value={missionForm.task} onChange={e => setMissionForm({...missionForm, task: e.target.value})} rows={4} className="w-full border-[3px] border-black p-4 text-xs font-bold focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Reward (RC)</label>
                      <input required type="number" value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})} className="w-full border-[3px] border-black p-4 text-xs font-black focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Timeline</label>
                      <input required value={missionForm.deadline} onChange={e => setMissionForm({...missionForm, deadline: e.target.value})} className="w-full border-[3px] border-black p-4 text-xs font-black uppercase focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#834bf1] text-white py-5 border-[3px] border-black shadow-[6px_6px_0px_#000] font-black text-[10px] uppercase tracking-[0.4em] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                    Initiate Deployment
                  </button>
               </form>
            </div>
            <div className="lg:col-span-8 space-y-8">
               <h2 className="text-4xl font-black uppercase tracking-tighter">Mission Log</h2>
               <div className="bg-white border-[4px] border-black p-8 text-center text-black/40 font-black uppercase tracking-widest h-64 flex items-center justify-center">
                  Live Stream Synchronizing...
               </div>
            </div>
          </div>
        )}
      </div>

      {isEmailing && selectedApp && (
        <EmailComposer application={selectedApp} onClose={() => setIsEmailing(false)} />
      )}
    </div>
  );
};
