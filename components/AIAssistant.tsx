
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hi! I'm ReelyAI. How can I help your business grow using AI marketing today?" }
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
    const apiKey = (process.env as any).API_KEY;

    if (!apiKey) {
      setMessages(prev => [...prev, 
        { role: 'user', content: userMsg },
        { role: 'assistant', content: "I'm sorry, I'm missing my API key to process this request. Please check the project settings." }
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are ReelyAI, the helpful AI assistant for Reelywood Studio. Reelywood is an AI-driven marketing agency for SMEs. Keep responses professional, helpful, and focused on growth strategies like AI automation, branding, web dev, and content creation. Keep answers concise.",
          temperature: 0.7,
        }
      });

      const aiResponse = response.text || "I'm sorry, I couldn't process that. How about we book a call with our experts?";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of a technical hiccup. Would you like to speak with our human team directly?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 group relative"
        >
          <Sparkles className="group-hover:animate-pulse" size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white"></div>
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-indigo-600 p-6 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">ReelyAI Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-[10px] opacity-70">Always online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none">
                  <Loader2 className="animate-spin text-indigo-600" size={18} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                type="text" 
                placeholder="Ask about your brand growth..." 
                className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">Powered by Reelywood Studio AI</p>
          </div>
        </div>
      )}
    </div>
  );
};
