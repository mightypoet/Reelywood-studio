import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

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
     * Authentication State Listener
     * Fires on app load and whenever the user signs in or out.
     * Synchronization is now handled at the App.tsx root level.
     */
    // Fixed: Correct usage of onAuthStateChanged from firebase/auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Fixed: Correct usage of signInWithPopup from firebase/auth
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("AUTH: Google Auth Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Fixed: Correct usage of signOut from firebase/auth
      await signOut(auth);
    } catch (error) {
      console.error("AUTH: Logout Error:", error);
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