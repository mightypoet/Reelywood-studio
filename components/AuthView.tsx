
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, Loader2, AlertCircle, ExternalLink, Copy, Check, Play } from 'lucide-react';

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
      
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError({
          code: 'auth/unauthorized-domain',
          message: "This domain is not authorized in your Firebase project.",
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
    <div className="min-h-screen bg-[#834bf1] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center space-x-3 bg-white border-[3px] border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all mb-10 group"
        >
          <ArrowLeft size={18} className="text-black group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-widest text-black">Return to Experience</span>
        </button>

        <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 lg:p-12 rounded-none">
          
          {error?.code === 'auth/unauthorized-domain' ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-rose-500 border-[3px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000]">
                  <AlertCircle size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black text-black leading-tight font-display uppercase tracking-tighter">Authorize Domain</h2>
                <p className="text-black font-bold text-sm leading-relaxed">
                  Firebase security blocks auth from this URL. Add this domain in your <span className="text-[#834bf1] underline">Firebase Console</span>.
                </p>
              </div>

              <div className="bg-[#ffde59] border-[3px] border-black p-5 space-y-3 shadow-[4px_4px_0px_0px_#000]">
                <p className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Authorized Domains Config:</p>
                <div className="flex items-center justify-between bg-white border-[2px] border-black px-4 py-2">
                  <code className="text-black font-black text-xs truncate mr-2">{error.domain}</code>
                  <button 
                    onClick={handleCopyDomain}
                    className="p-2 hover:bg-slate-50 text-black transition-colors"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <a 
                  href="https://console.firebase.google.com/project/_/authentication/providers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-3 bg-black text-white py-5 border-[3px] border-black font-black uppercase text-xs tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_0px_#834bf1] transition-all"
                >
                  <span>Open Console</span>
                  <ExternalLink size={18} />
                </a>
                <button 
                  onClick={onBack}
                  className="w-full flex items-center justify-center space-x-3 bg-white border-[3px] border-black py-5 font-black text-black uppercase text-xs tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_0px_#000] transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  <span>Enter Demo Mode</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ffde59] border-[3px] border-black shadow-[6px_6px_0px_0px_#000] mb-2">
                  <Sparkles size={40} className="text-black" />
                </div>
                <h1 className="text-4xl font-black text-black font-display uppercase tracking-tighter leading-none">
                  Log in <br /> or sign up
                </h1>
                <p className="text-black/60 text-[10px] font-black uppercase tracking-[0.3em]">Access the REELYWOOD brand dashboard</p>
              </div>

              {error && (
                <div className="mb-8 p-5 bg-rose-50 border-[3px] border-black flex items-start space-x-3 text-rose-600 animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{error.message}</p>
                </div>
              )}

              <div className="space-y-6">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-4 bg-white border-[3px] border-black py-6 font-black text-black uppercase text-xs tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[8px_8px_0px_0px_#000] transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
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

                <div className="relative py-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-[3px] border-black"></div>
                  </div>
                  <div className="relative flex justify-center text-[8px] uppercase tracking-[0.5em] font-black text-black">
                    <span className="bg-white px-6">Direct Secure Link</span>
                  </div>
                </div>

                <div className="p-6 bg-[#ffde59] border-[3px] border-black shadow-[6px_6px_0px_0px_#000] text-center">
                  <p className="text-[10px] text-black font-black uppercase tracking-widest leading-relaxed">
                    No Project Access? Contact your admin node.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-black font-black text-[10px] uppercase tracking-[0.4em] hover:text-[#834bf1] transition-colors border-b-[2px] border-black"
                >
                  {mode === 'login' ? 'Switch to Signup Mode' : 'Return to Login Mode'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
