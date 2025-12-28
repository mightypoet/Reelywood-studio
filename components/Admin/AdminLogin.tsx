
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Sparkles, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onSuccess }) => {
  const { loginWithGoogle, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminAuth = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Auth success, but we need to check if the user is the super admin
    } catch (err: any) {
      setError("Failed to authenticate. Access denied.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Effect to check email after successful login attempt
  React.useEffect(() => {
    if (user) {
      if (user.email === 'rohan00as@gmail.com') {
        onSuccess();
      } else {
        setError("Unauthorized access. This account does not have admin privileges.");
      }
    }
  }, [user, onSuccess]);

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-white/40 hover:text-white transition-all mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Studio Terminal</span>
        </button>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 lg:p-14 shadow-2xl">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/20 text-white mb-2">
              <ShieldCheck size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Admin Portal</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">Restricted Transmission Node</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 text-rose-400 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed uppercase tracking-wider">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <button 
              onClick={handleAdminAuth}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-4 bg-white text-slate-900 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
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
              <span>Secure Admin Access</span>
            </button>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">
                Super Admin Only • Authorized Access Only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
