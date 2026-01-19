
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/clients';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Authenticate with Google
      const result: any = await loginWithGoogle();
      const user = result?.user;

      if (user && supabase) {
        // 2. Tiered Redirect Logic
        
        // Check Admin Table
        const { data: adminData } = await supabase
          .from('admins')
          .select('role')
          .eq('email', user.email)
          .maybeSingle();

        if (adminData) {
          onClose();
          // We use window.location here to force the routing sync if needed, 
          // or rely on App.tsx state which is listening to onAuthStateChanged
          return;
        }

        // Check Partner Brand Table
        const { data: brandData } = await supabase
          .from('partner_brands')
          .select('id')
          .eq('brand_email', user.email)
          .maybeSingle();

        if (brandData) {
          onClose();
          return;
        }
      }
      
      onClose();
    } catch (err: any) {
      console.error("Login Failed:", err);
      setError("Authentication Handshake Failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000] p-8 md:p-12 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 border-2 border-transparent hover:border-black transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-6 mb-12">
          <div className="w-16 h-16 bg-[#834bf1] border-[3px] border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
            <Sparkles className="text-white" size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">LOG IN / SIGN UP</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Identity Sync Protocol • Reelywood</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-[3px] border-black flex items-center gap-3 text-rose-600">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase">{error}</span>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
        >
          {loading ? (
            <span className="text-xs font-black uppercase tracking-widest animate-pulse">Initializing...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M24 12.25c0-.82-.07-1.61-.21-2.38H12v4.5h6.72c-.29 1.57-1.18 2.89-2.5 3.78v3.13h4.05c2.37-2.18 3.73-5.39 3.73-9.03Z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.19-3.88 1.19-2.99 0-5.52-2.01-6.42-4.73H1.47v3.23C3.44 21.65 7.42 24 12 24Z"/>
                <path fill="#4285F4" d="M5.58 14.42A7.17 7.17 0 0 1 5.14 12c0-.85.15-1.67.44-2.42V6.35H1.47A11.98 11.98 0 0 0 0 12c0 2.12.55 4.12 1.47 5.88l4.11-3.46Z"/>
                <path fill="#FBBC05" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.08 15.24 0 12 0 7.42 0 3.44 2.35 1.47 6.35l4.11 3.46c.9-2.72 3.43-4.73 6.42-4.73Z"/>
              </svg>
              <span className="font-black text-xs uppercase tracking-[0.2em]">Continue with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-4 my-8">
          <div className="h-[2px] bg-black/10 flex-1"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/30">Secure Gateway</span>
          <div className="h-[2px] bg-black/10 flex-1"></div>
        </div>

        <div className="bg-[#ffde59] border-[3px] border-black p-4 text-center shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
            No Platform Access? <br/> Contact Terminal Admin.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-black/5 text-center space-y-2">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-black hover:text-[#834bf1] underline decoration-2 underline-offset-4">
            Create Agency Account
          </button>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-black/20">Production Node v4.0.1</p>
        </div>
      </div>
    </div>
  );
};
