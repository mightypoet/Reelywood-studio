
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, Chrome, Sparkles, Loader2, AlertCircle, ExternalLink, Copy, Check, Play, ShieldAlert } from 'lucide-react';

interface AuthViewProps {
  onBack: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ onBack, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ code: string; message: string; domain?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleCopyDomain = () => {
    if (error?.domain) {
      navigator.clipboard.writeText(error.domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      onBack(); 
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      // Explicitly catch and handle the unauthorized domain error
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError({
          code: 'auth/unauthorized-domain',
          message: "DOMAIN_NOT_WHITELISTED: This URL is not authorized in the Firebase production node.",
          domain: window.location.hostname
        });
      } else {
        setError({
          code: err.code || 'unknown',
          message: err.message || "Failed to sign in. Please try again."
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden font-lexend">
      {/* Neobrutalist background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center space-x-3 bg-[#ffde59] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-2.5 mb-10 font-black uppercase text-[11px] tracking-[0.2em] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          <span>Return to Experience</span>
        </button>

        <div className="bg-white dark:bg-black border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] p-8 lg:p-12 rounded-none transition-colors duration-500">
          
          {error?.code === 'auth/unauthorized-domain' ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-rose-500 border-[3px] border-black text-white rounded-none flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldAlert size={40} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white leading-tight uppercase font-display italic">Protocol Error</h2>
                <div className="bg-rose-100 border-2 border-rose-500 p-3">
                   <p className="text-rose-700 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    UNAUTHORIZED_DOMAIN
                  </p>
                </div>
                <p className="text-black/60 dark:text-white/60 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Security protocols prevent authentication from this domain. Add the following URL to your <span className="text-[#834bf1] font-black">Firebase Authorized Domains</span> list.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900 border-[3px] border-black rounded-none p-5 space-y-4">
                <p className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]">Copy this domain:</p>
                <div className="flex items-center justify-between bg-white dark:bg-black border-[3px] border-black rounded-none px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <code className="text-[#834bf1] font-black text-xs truncate mr-2">{error.domain}</code>
                  <button 
                    onClick={handleCopyDomain}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 text-black dark:text-white transition-all active:scale-90"
                  >
                    {copied ? <Check size={18} className="text-emerald-500" strokeWidth={4} /> : <Copy size={18} strokeWidth={3} />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-3 bg-[#834bf1] text-white py-5 border-[3px] border-black font-black uppercase text-xs tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <span>Open Firebase Console</span>
                  <ExternalLink size={18} strokeWidth={3} />
                </a>
                <p className="text-[8px] font-black text-center text-black/30 uppercase tracking-[0.3em]">
                  Path: Authentication > Settings > Authorized Domains
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#834bf1] border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white mb-2">
                  <Sparkles size={40} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter leading-none mb-2">
                    Identity Sync
                  </h1>
                  <p className="text-black/50 dark:text-white/50 text-[10px] font-black uppercase tracking-[0.4em]">
                    Production Node Access • Reelywood
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-rose-500 text-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start space-x-3 animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" strokeWidth={3} />
                  <p className="text-xs font-black uppercase tracking-wide leading-relaxed">{error.message}</p>
                </div>
              )}

              <div className="space-y-6">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-4 bg-white dark:bg-white text-black border-[3px] border-black py-5 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:translate-none disabled:shadow-none"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path fill="#EA4335" d="M24 12.25c0-.82-.07-1.61-.21-2.38H12v4.5h6.72c-.29 1.57-1.18 2.89-2.5 3.78v3.13h4.05c2.37-2.18 3.73-5.39 3.73-9.03Z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.19-3.88 1.19-2.99 0-5.52-2.01-6.42-4.73H1.47v3.23C3.44 21.65 7.42 24 12 24Z"/>
                      <path fill="#4285F4" d="M5.58 14.42A7.17 7.17 0 0 1 5.14 12c0-.85.15-1.67.44-2.42V6.35H1.47A11.98 11.98 0 0 0 0 12c0 2.12.55 4.12 1.47 5.88l4.11-3.46Z"/>
                      <path fill="#FBBC05" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.08 15.24 0 12 0 7.42 0 3.44 2.35 1.47 6.35l4.11 3.46c.9-2.72 3.43-4.73 6.42-4.73Z"/>
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-[3px] border-black"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black text-black">
                    <span className="bg-white dark:bg-black px-4">Secure Gateway</span>
                  </div>
                </div>

                <div className="p-5 bg-[#ffde59] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                  <p className="text-[10px] text-black font-black uppercase tracking-[0.2em] leading-relaxed">
                    No Platform Access? <br /> Contact Terminal Admin.
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t-[3px] border-black flex flex-col space-y-4">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-black dark:text-white font-black uppercase text-[11px] tracking-[0.2em] hover:text-[#834bf1] underline decoration-[2px] underline-offset-8 decoration-black/20 hover:decoration-[#834bf1] transition-all"
                >
                  {mode === 'login' ? 'Register New Authority' : 'Return to Secure Login'}
                </button>
                <p className="text-[8px] font-black uppercase text-black/30 dark:text-white/20 tracking-[0.5em] text-center">
                  Production Node v4.0.1
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
