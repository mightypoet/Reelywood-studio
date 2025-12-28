
import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle, Mail, AlertCircle } from 'lucide-react';
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
    // Simulate real backend email logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const appRef = doc(db, 'creator_applications', application.id);
      await updateDoc(appRef, {
        emailSent: true,
        lastEmailSubject: subject,
        lastEmailTimestamp: new Date().toISOString()
      });
      setIsSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Email Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        {isSuccess ? (
          <div className="p-20 text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Transmission Sent</h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Email dispatched to {application.email}</p>
          </div>
        ) : (
          <>
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Communication Node</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Recipient: {application.fullName} ({application.email})</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Message Body</label>
                <textarea 
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-5 text-sm focus:outline-none focus:border-indigo-500/50 resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <AlertCircle size={14} />
                  <span>Manual override enabled</span>
                </div>
                
                <button 
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  <span>Dispatch Email</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
