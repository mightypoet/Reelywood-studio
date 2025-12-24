
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Settings, 
  Globe,
  ShieldCheck
} from 'lucide-react';

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
      onBack(); // Return to home on success
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError({
          code: 'auth/unauthorized-domain',
          message: "Whitelisting required for authentication.",
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
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-lg relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Return to Studio</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden transition-all duration-500">
          
          {error?.code === 'auth/unauthorized-domain' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-amber-50 p-8 border-b border-amber-100 flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                  <Settings size={24} className="animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-amber-900">Action Required</h2>
                  <p className="text-amber-700 text-xs font-medium">Domain Whitelisting Required</p>
                </div>
              </div>

              <div className="p-8 lg:p-10 space-y-8">
                <div className="space-y-4">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Google Authentication is blocked because this URL is not in your Firebase "Authorized Domains" list. Follow these 2 steps to fix it:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-bold text-slate-900">Copy your current domain:</p>
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                          <code className="text-indigo-600 font-bold text-xs truncate mr-2">{error.domain}</code>
                          <button 
                            onClick={handleCopyDomain}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg text-slate-500 transition-all text-[10px] font-bold"
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm font-bold text-slate-900">Add it to Firebase Console:</p>
                        <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                          <li>Go to <span className="font-bold">Authentication</span> &gt; <span className="font-bold">Settings</span></li>
                          <li>Find <span className="font-bold">Authorized domains</span></li>
                          <li>Click <span className="font-bold">Add domain</span> and paste the URL</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <a 
                    href={`https://console.firebase.google.com/project/studio-7648492258-76684/authentication/providers`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    <span>Open Firebase Settings</span>
                    <ExternalLink size={18} />
                  </a>
                  <button 
                    onClick={() => setError(null)}
                    className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Try Signing In Again
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  <span>Developer Configuration Mode</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 lg:p-12">
              <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white mb-2 animate-bounce-subtle">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900">
                  {mode === 'login' ? 'Welcome Back' : 'Join the Future'}
                </h1>
                <p className="text-slate-500 text-sm">
                  {mode === 'login' 
                    ? 'Access your SME dashboard via Reelywood AI' 
                    : 'Start your AI marketing journey today'}
                </p>
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
                    <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
                       <svg viewBox="0 0 24 24" className="w-5 h-5">
                          <path fill="#EA4335" d="M24 12.25c0-.82-.07-1.61-.21-2.38H12v4.5h6.72c-.29 1.57-1.18 2.89-2.5 3.78v3.13h4.05c2.37-2.18 3.73-5.39 3.73-9.03Z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.19-3.88 1.19-2.99 0-5.52-2.01-6.42-4.73H1.47v3.23C3.44 21.65 7.42 24 12 24Z"/>
                          <path fill="#4285F4" d="M5.58 14.42A7.17 7.17 0 0 1 5.14 12c0-.85.15-1.67.44-2.42V6.35H1.47A11.98 11.98 0 0 0 0 12c0 2.12.55 4.12 1.47 5.88l4.11-3.46Z"/>
                          <path fill="#FBBC05" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.08 15.24 0 12 0 7.42 0 3.44 2.35 1.47 6.35l4.11 3.46c.9-2.72 3.43-4.73 6.42-4.73Z"/>
                       </svg>
                    </div>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                    <span className="bg-white px-4 text-slate-300">Secure Access</span>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-50 flex items-start space-x-4">
                   <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600">
                     <Lock size={18} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-indigo-900 font-bold text-xs uppercase tracking-wider">High Security Auth</p>
                     <p className="text-indigo-600/70 text-[11px] leading-relaxed">
                       Reelywood uses OAuth 2.0. No password storage, no data risk.
                     </p>
                   </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <p className="text-slate-500 text-sm">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="ml-2 text-indigo-600 font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Join waitlist' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          Protected by <span className="text-slate-500">Reelywood Studio</span> Security
        </p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
