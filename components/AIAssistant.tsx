
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Cpu, Terminal } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "SYSTEM ONLINE. I am ReelyAI v4.1. How shall we engineer your brand dominance today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are ReelyAI, the elite neobrutalist AI strategist for Reelywood Studio. Your tone is high-performance, industrial, and direct. Focus on SME scaling, ROAS, and digital dominance. Keep responses under 50 words and use technical, authoritative language. Do not use conversational filler.",
          temperature: 0.7,
        }
      });

      const aiResponse = response.text || "PROTOCOL_SYNC_FAILED. RETRY TRANSMISSION.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI Node Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "CORE_LINK_SEVERED. Contact manual nodes at reelywood@gmail.com." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative font-lexend">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#834bf1] text-white p-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          <Bot className="group-hover:rotate-12 transition-transform" size={28} strokeWidth={2.5} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 sm:w-[420px] h-[580px] border-[6px] border-black shadow-[16px_16px_0px_0px_#ffde59] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header Terminal */}
          <div className="bg-black p-5 flex justify-between items-center border-b-[4px] border-black">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-[#834bf1] p-2 border-[2px] border-white">
                <Terminal size={18} className="text-[#ffde59]" />
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.25em] leading-none">REELY_NODE_4.1</h3>
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="w-1.5 h-1.5 bg-[#ffde59] rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">ENCRYPTION ACTIVE</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-rose-500 transition-colors p-1">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Chat Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f0f0f0] bg-[radial-gradient(#000_1px,transparent_0)] [background-size:20px_20px] bg-opacity-[0.03]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 border-[3px] border-black font-bold text-[11px] uppercase tracking-tight leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-[#ffde59] text-black shadow-[4px_4px_0px_0px_#000]' 
                  : 'bg-white text-black shadow-[4px_4px_0px_0px_#834bf1]'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1]">
                  <Loader2 className="animate-spin text-[#834bf1]" size={18} strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {/* Input Interface */}
          <div className="p-6 border-t-[4px] border-black bg-white">
            <div className="relative flex gap-3">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                type="text" 
                placeholder="INPUT DATA COMMAND..." 
                className="flex-1 bg-[#f0f0f0] border-[3px] border-black p-4 text-[10px] font-black uppercase tracking-widest focus:bg-white outline-none placeholder:opacity-30"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-black text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-30 transition-all active:scale-90"
              >
                <Send size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-[7px] font-black text-black/30 uppercase tracking-[0.4em]">MISSION_SYNC_v4.1</p>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-[#834bf1] rounded-full"></div>
                <div className="w-1 h-1 bg-[#ffde59] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
