
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "SYSTEM ONLINE. I am ReelyAI. How shall we scale your brand dominance today?" }
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
          systemInstruction: "You are ReelyAI, the neobrutalist-styled AI strategist for Reelywood Studio. Reelywood is an elite AI-driven marketing agency for SMEs. Your tone is high-performance, direct, and slightly industrial. Focus on ROAS, scalability, and technical authority. Keep responses under 50 words.",
          temperature: 0.8,
        }
      });

      const aiResponse = response.text || "CONNECTION INTERRUPTED. RETRY PROTOCOL.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "CORE SYNC ERROR. Please reach out to our human nodes at reelywood@gmail.com." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative font-lexend">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#834bf1] text-white p-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group"
        >
          <Bot className="group-hover:rotate-12 transition-transform" size={28} strokeWidth={2.5} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 sm:w-[400px] h-[550px] border-[6px] border-black shadow-[16px_16px_0px_0px_#ffde59] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-black p-5 flex justify-between items-center border-b-[4px] border-black">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-[#834bf1] p-2 border-[2px] border-white">
                <Sparkles size={20} className="text-[#ffde59]" />
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em]">REELY_AI v4.1</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-[#ffde59] rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">UPLINK ACTIVE</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#ffde59] transition-colors p-1">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f0f0f0]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 border-[3px] border-black font-bold text-xs uppercase tracking-tight ${
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

          <div className="p-5 border-t-[4px] border-black bg-white">
            <div className="relative flex gap-3">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                type="text" 
                placeholder="INPUT DATA..." 
                className="flex-1 bg-[#f0f0f0] border-[3px] border-black p-4 text-xs font-black uppercase tracking-widest focus:bg-white outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-[#834bf1] text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 transition-all"
              >
                <Send size={18} strokeWidth={3} />
              </button>
            </div>
            <p className="text-[8px] font-black text-center text-black/30 mt-4 uppercase tracking-[0.4em]">MISSION CRITICAL AGENT SYNC</p>
          </div>
        </div>
      )}
    </div>
  );
};
