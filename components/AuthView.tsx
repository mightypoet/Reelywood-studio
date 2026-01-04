
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, Chrome, Sparkles, Loader2, AlertCircle, ExternalLink, Copy, Check, Play } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]"></div>

      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Return to Experience</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(79,70,229,0.1)] border border-slate-100 p-8 lg:p-12">
          
          {error?.code === 'auth/unauthorized-domain' ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Authorize Domain</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Firebase security blocks auth from this URL. To fix, add this domain in your <span className="text-indigo-600 font-bold">Firebase Console</span>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add this to Authorized Domains:</p>
                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2">
                  <code className="text-indigo-600 font-bold text-sm truncate mr-2">{error.domain}</code>
                  <button 
                    onClick={handleCopyDomain}
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href="https://console.firebase.google.com/project/_/authentication/providers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <span>Open Console</span>
                  <ExternalLink size={18} />
                </a>
                <div className="pt-2">
                  <button 
                    onClick={onBack}
                    className="w-full flex items-center justify-center space-x-2 border border-slate-200 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Enter Demo Mode (Bypass)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white mb-2">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900">
                  {mode === 'login' ? 'Auth Required' : 'Join Waitlist'}
                </h1>
                <p className="text-slate-500 text-sm">Access the REELYWOOD brand dashboard</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-600 animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{error.message}</p>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 12.25c0-.82-.07-1.61-.21-2.38H12v4.5h6.72c-.29 1.57-1.18 2.89-2.5 3.78v3.13h4.05c2.37-2.18 3.73-5.39 3.73-9.03Z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.19-3.88 1.19-2.99 0-5.52-2.01-6.42-4.73H1.47v3.23C3.44 21.65 7.42 24 12 24Z"/>
                      <path fill="#4285F4" d="M5.58 14.42A7.17 7.17 0 0 1 5.14 12c0-.85.15-1.67.44-2.42V6.35H1.47A11.98 11.98 0 0 0 0 12c0 2.12.55 4.12 1.47 5.88l4.11-3.46Z"/>
                      <path fill="#FBBC05" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.08 15.24 0 12 0 7.42 0 3.44 2.35 1.47 6.35l4.11 3.46c.9-2.72 3.43-4.73 6.42-4.73Z"/>
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-slate-300">
                    <span className="bg-white px-4">Direct Secure Link</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    No Project Access? Contact your admin.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-indigo-600 font-bold text-sm hover:underline"
                >
                  {mode === 'login' ? 'Switch to Signup' : 'Return to Login'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
