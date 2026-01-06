import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { syncUserToSupabase } from '../utils/authSync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Auth State Change Listener
     * Handles both initial session loading and live login/logout events.
     */
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Auth State Changed: User Logged In");
        
        // IMMEDIATELLY call syncUserToSupabase(user) whenever user is not null.
        try {
          await syncUserToSupabase(currentUser);
        } catch (syncErr) {
          console.error("AuthContext: Failed to trigger background sync:", syncErr);
        }
      } else {
        console.log("Auth State Changed: User Logged Out");
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        console.log("Google Login Successful, initiating sync protocol...");
        // Manual trigger after login for immediate data availability
        await syncUserToSupabase(result.user);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Sign out successful");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};