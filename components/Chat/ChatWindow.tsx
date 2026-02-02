
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { X, Send, Loader2, User, Terminal, Zap } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  recipientPhoto?: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  currentUserId, 
  recipientId, 
  recipientName, 
  recipientPhoto,
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    
    // REALTIME SUBSCRIPTION
    const channel = supabase!
      .channel('realtime-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only add if it belongs to this specific conversation
          if (
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === recipientId) ||
            (newMessage.sender_id === recipientId && newMessage.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [recipientId]);

  useEffect(scrollToBottom, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase!
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("CHAT_FETCH_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase!
        .from('messages')
        .insert([{
          sender_id: currentUserId,
          receiver_id: recipientId,
          content: input.trim()
        }]);

      if (error) throw error;
      setInput('');
    } catch (err: any) {
      alert("SIGNAL_LOST: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-10 z-[1200] w-[90vw] sm:w-[380px] h-[500px] bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_#000] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <header className="bg-black text-white p-4 border-b-[6px] border-black flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#834bf1] border-2 border-white overflow-hidden shadow-[2px_2px_0px_0px_#ffde59]">
            <img src={recipientPhoto || `https://api.dicebear.com/7.x/identicon/svg?seed=${recipientId}`} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase italic font-display leading-none">{recipientName}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[7px] font-black uppercase tracking-widest opacity-50">NODE_ACTIVE</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-rose-500 transition-colors">
          <X size={20} strokeWidth={4} />
        </button>
      </header>

      {/* Messages list */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f8f8] custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-[8px] font-black uppercase tracking-[0.4em]">Syncing History...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 italic">
             <Terminal size={40} className="mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">Grid Silent. Send a signal.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMe ? 'bg-[#ffde59] text-black' : 'bg-white text-black'}`}>
                  <p className="text-[11px] font-bold leading-relaxed">{msg.content}</p>
                  <p className="text-[6px] font-black uppercase opacity-30 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input area */}
      <footer className="p-4 bg-white border-t-[6px] border-black shrink-0">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type signal..."
            className="flex-1 bg-slate-50 border-[3px] border-black p-3 font-black text-[10px] uppercase tracking-widest focus:bg-white outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-black text-white p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-90 disabled:opacity-20"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
          </button>
        </form>
      </footer>
    </div>
  );
};
