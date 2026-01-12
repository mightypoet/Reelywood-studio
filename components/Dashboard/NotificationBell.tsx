import React, { useState, useEffect } from 'react';
import { Bell, X, Zap, Gift, Coins, Signal } from 'lucide-react';
import { supabase } from '../../lib/clients';

export const NotificationBell: React.FC<{ userId: string }> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications for this specific user
    const channel = supabase?.channel(`user-notifs-${userId}`)
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
          (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 10));
          })
      .subscribe();

    return () => { supabase?.removeChannel(channel as any); };
  }, [userId]);

  const markAsRead = async (id: string) => {
    if (!supabase) return;
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'MISSION_DEPLOYED': return <Zap size={14} className="text-[#834bf1]" />;
      case 'VOUCHER_ADDED': return <Gift size={14} className="text-blue-500" />;
      case 'RC_CREDIT': return <Coins size={14} className="text-emerald-500" />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 border-[3px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_#000] relative hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        <Bell size={22} strokeWidth={3} />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white border-[2.5px] border-black px-1.5 min-w-[24px] h-6 flex items-center justify-center text-[10px] font-black shadow-[2px_2px_0px_0px_#000]">
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] z-[70] animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b-[3px] border-black bg-black text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Signal size={14} className="text-[#ffde59] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Signal Feed</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-rose-500 transition-colors">
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-[9px] font-black uppercase text-black/20 italic tracking-widest leading-relaxed">
                  Grid Silent. <br/> No incoming transmissions.
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-5 border-b-[2px] border-black/5 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-indigo-50/40' : ''}`}
                  >
                    {!n.is_read && <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-[#834bf1] rounded-none border border-black animate-pulse"></div>}
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 bg-white border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_#000]">{getIcon(n.type)}</div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase leading-tight">{n.title}</p>
                        <p className="text-[9px] font-bold text-black/50 leading-snug uppercase tracking-tight">{n.message}</p>
                        <p className="text-[7px] font-black opacity-30 uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 bg-slate-50 text-center border-t-[3px] border-black">
               <button className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity">Archive Feed</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};