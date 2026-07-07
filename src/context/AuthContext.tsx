import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  googleToken: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  setGoogleToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const firebaseToken = await firebaseUser.getIdToken();
        setToken(firebaseToken);
        
        // Retrieve stored Google ID token if available, otherwise fallback to Firebase Token
        const storedGoogleToken = localStorage.getItem('google_id_token');
        if (storedGoogleToken) {
          setGoogleToken(storedGoogleToken);
        } else {
          setGoogleToken(firebaseToken);
        }
      } else {
        setUser(null);
        setToken(null);
        setGoogleToken(null);
        localStorage.removeItem('google_id_token');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const idToken = credential.idToken;
        if (idToken) {
          setGoogleToken(idToken);
          localStorage.setItem('google_id_token', idToken);
        }
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      setGoogleToken(null);
      localStorage.removeItem('google_id_token');
    } catch (error) {
      console.error('Sign-Out failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, googleToken, loading, signIn, logOut, setGoogleToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

