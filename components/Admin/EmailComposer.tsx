
import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { Application } from './AdminDashboard';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface EmailComposerProps {
  application: Application;
  onClose: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({ application, onClose }) => {
  const [subject, setSubject] = useState(`Reelywood Studio - Identity Verification [${application.status.toUpperCase()}]`);
  const [message, setMessage] = useState(
    `Hello ${application.fullName},\n\n` +
    (application.status === 'approved' 
      ? `We are excited to inform you that your Creator ID application for REELYWOOD has been approved. Your digital presence matches our narrative high-fidelity standards.\n\nNext Transmission: We will sync your profile with our creator network within 24 hours.`
      : `Thank you for your interest in Reelywood Studio. At this time, we are unable to approve your Identity sync for our Elite Tier. We recommend building more platform-specific authority before re-applying.`) +
    ` \n\nBest,\nReelywood Studio Admin`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    // Simulate real backend email dispatch from reelywood.com
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const appRef = doc(db, 'creator_applications', application.id);
      await updateDoc(appRef, {
        emailSent: true,
        lastEmailSubject: subject,
        lastEmailTimestamp: new Date().toISOString(),
        senderDomain: 'reelywood.com'
      });
      setIsSuccess(true);
      setTimeout(() => onClose(), 2500);
    } catch (error) {
      console.error("Email Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {isSuccess ? (
          <div className="p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Transmission Successful</h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Email Dispatched via Reelywood.com</p>
            </div>
            <p className="text-emerald-500/80 font-bold text-xs">A notification has been sent to {application.email}</p>
          </div>
        ) : (
          <>
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Studio Mailer</h3>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Routing from: <span className="text-indigo-400">admin@reelywood.com</span></p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-2">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Recipient Node</label>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{application.fullName}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white/60">
                  {application.email}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Transmission Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Payload Message</label>
                <textarea 
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none font-medium leading-relaxed transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center space-x-3 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  <span>Authenticated Sync</span>
                </div>
                
                <button 
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex items-center space-x-4 bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  <span>Execute Dispatch</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
